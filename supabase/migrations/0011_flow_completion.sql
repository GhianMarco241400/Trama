-- 0011_flow_completion.sql
-- Completa el flujo end-to-end: correlativo de comprobantes, caja en ventas
-- al contado, creacion/aprobacion de compras y recepcion de mercaderia.

-- ---------------------------------------------------------------------------
-- Correlativo de comprobantes (boleta/factura) segun settings.receipt_format
-- ---------------------------------------------------------------------------
create or replace function public.fn_next_receipt_number(p_type public.receipt_type)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_count integer;
begin
  select coalesce(receipt_format, 'B001') into v_prefix from public.settings where id = 1;

  if p_type = 'factura' then
    v_prefix := replace(v_prefix, 'B', 'F');
  end if;

  v_prefix := split_part(v_prefix, '-', 1);

  select count(*) into v_count
    from public.sales
    where receipt_type = p_type;

  return v_prefix || '-' || lpad((v_count + 1)::text, 5, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Caja por defecto para ventas al contado
-- ---------------------------------------------------------------------------
create or replace function public.fn_default_cash_account()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.accounts
    where type = 'caja' and status = 'activo'
    order by created_at
    limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Registrar venta: crea venta + items, descuenta stock, kardex, CxC y caja
-- ---------------------------------------------------------------------------
create or replace function public.fn_register_sale(
  p_customer_id uuid,
  p_seller_id uuid,
  p_warehouse_id uuid,
  p_receipt_type public.receipt_type,
  p_receipt_number text,
  p_payment_method public.payment_method,
  p_items jsonb,
  p_igv_rate numeric default 0.18,
  p_account_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_igv numeric(12, 2);
  v_total numeric(12, 2);
  v_code text;
  v_receipt text;
  v_account_id uuid;
  v_item jsonb;
  v_balance integer;
begin
  v_code := 'V-' || lpad((coalesce((select count(*) from public.sales), 0) + 1)::text, 5, '0');
  v_receipt := coalesce(p_receipt_number, public.fn_next_receipt_number(p_receipt_type));

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_subtotal := v_subtotal + (v_item ->> 'unit_price')::numeric * (v_item ->> 'quantity')::integer;
  end loop;

  v_igv := round(v_subtotal * p_igv_rate, 2);
  v_total := v_subtotal + v_igv;

  insert into public.sales (
    code, customer_id, seller_id, warehouse_id, receipt_type, receipt_number,
    payment_method, subtotal, igv, total, status
  )
  values (
    v_code, p_customer_id, p_seller_id, p_warehouse_id, p_receipt_type, v_receipt,
    p_payment_method, v_subtotal, v_igv, v_total,
    case when p_payment_method = 'efectivo' then 'pagada'::public.sale_status else 'pendiente'::public.sale_status end
  )
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.sale_items (sale_id, variant_id, quantity, unit_price, line_total)
    values (
      v_sale_id,
      (v_item ->> 'variant_id')::uuid,
      (v_item ->> 'quantity')::integer,
      (v_item ->> 'unit_price')::numeric,
      (v_item ->> 'unit_price')::numeric * (v_item ->> 'quantity')::integer
    );

    update public.inventory
      set stock = stock - (v_item ->> 'quantity')::integer
      where variant_id = (v_item ->> 'variant_id')::uuid
        and warehouse_id = p_warehouse_id
      returning stock into v_balance;

    insert into public.stock_movements (
      variant_id, warehouse_id, type, reason, document_ref, quantity, resulting_balance, user_id
    )
    values (
      (v_item ->> 'variant_id')::uuid, p_warehouse_id, 'salida', 'venta', v_code,
      (v_item ->> 'quantity')::integer, coalesce(v_balance, 0), p_seller_id
    );
  end loop;

  if p_payment_method = 'efectivo' then
    v_account_id := coalesce(p_account_id, public.fn_default_cash_account());
    if v_account_id is not null then
      insert into public.account_movements (account_id, description, type, amount, reference, user_id)
      values (v_account_id, 'Venta al contado ' || v_receipt, 'ingreso', v_total, v_code, p_seller_id);

      update public.accounts
        set balance = balance + v_total
        where id = v_account_id;
    end if;
  else
    insert into public.receivables (code, customer_id, sale_id, receipt_number, total, balance, status)
    values (
      'CXC-' || lpad((coalesce((select count(*) from public.receivables), 0) + 1)::text, 3, '0'),
      p_customer_id, v_sale_id, v_receipt, v_total, v_total, 'pendiente'
    );
  end if;

  return v_sale_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Crear orden de compra con items y totales calculados
-- ---------------------------------------------------------------------------
create or replace function public.fn_create_purchase(
  p_supplier_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_igv_rate numeric default 0.18,
  p_notes text default null,
  p_issued_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_igv numeric(12, 2);
  v_total numeric(12, 2);
  v_code text;
  v_item jsonb;
begin
  v_code := 'OC-' || lpad((coalesce((select count(*) from public.purchases), 0) + 1)::text, 5, '0');

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_subtotal := v_subtotal + (v_item ->> 'unit_cost')::numeric * (v_item ->> 'quantity')::integer;
  end loop;

  v_igv := round(v_subtotal * p_igv_rate, 2);
  v_total := v_subtotal + v_igv;

  insert into public.purchases (
    code, supplier_id, issued_at, status, subtotal, igv, total, notes, created_by
  )
  values (
    v_code, p_supplier_id, p_issued_at, 'pendiente', v_subtotal, v_igv, v_total, p_notes, p_created_by
  )
  returning id into v_purchase_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.purchase_items (purchase_id, variant_id, quantity, unit_cost, line_total)
    values (
      v_purchase_id,
      (v_item ->> 'variant_id')::uuid,
      (v_item ->> 'quantity')::integer,
      (v_item ->> 'unit_cost')::numeric,
      (v_item ->> 'unit_cost')::numeric * (v_item ->> 'quantity')::integer
    );
  end loop;

  return v_purchase_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Aprobar compra: crea recepcion pendiente (con items) y CxP
-- ---------------------------------------------------------------------------
create or replace function public.fn_approve_purchase(
  p_purchase_id uuid,
  p_user_id uuid,
  p_due_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supplier_id uuid;
  v_total numeric(12, 2);
  v_code text;
  v_receipt_id uuid;
  v_receipt_code text;
begin
  select supplier_id, total into v_supplier_id, v_total
    from public.purchases where id = p_purchase_id;

  if v_supplier_id is null then
    raise exception 'Orden de compra no encontrada';
  end if;

  update public.purchases set status = 'aprobada' where id = p_purchase_id;

  select code into v_code from public.purchases where id = p_purchase_id;

  v_receipt_code := 'REC-' || lpad((coalesce((select count(*) from public.goods_receipts), 0) + 1)::text, 5, '0');

  insert into public.goods_receipts (code, purchase_id, supplier_id, status, total, notes)
  values (v_receipt_code, p_purchase_id, v_supplier_id, 'pendiente', v_total, 'Recepcion de ' || v_code)
  returning id into v_receipt_id;

  insert into public.goods_receipt_items (receipt_id, variant_id, requested_qty, received_qty)
  select v_receipt_id, variant_id, quantity, 0
  from public.purchase_items
  where purchase_id = p_purchase_id;

  insert into public.payables (code, supplier_id, purchase_id, receipt_number, issue_date, due_date, total, balance, status)
  values (
    'CXP-' || lpad((coalesce((select count(*) from public.payables), 0) + 1)::text, 3, '0'),
    v_supplier_id, p_purchase_id, v_code, current_date, p_due_date, v_total, v_total, 'pendiente'
  );

  return v_receipt_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Recepcionar mercaderia: suma stock, kardex y cierra recepcion/compra
-- ---------------------------------------------------------------------------
create or replace function public.fn_receive_goods(
  p_receipt_id uuid,
  p_warehouse_id uuid,
  p_user_id uuid,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_item jsonb;
  v_balance integer;
  v_received integer;
  v_all_received boolean;
begin
  select purchase_id into v_purchase_id from public.goods_receipts where id = p_receipt_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_received := (v_item ->> 'received_qty')::integer;

    if v_received > 0 then
      insert into public.inventory (variant_id, warehouse_id, stock, min_stock)
      values ((v_item ->> 'variant_id')::uuid, p_warehouse_id, v_received, 0)
      on conflict (variant_id, warehouse_id)
        do update set stock = public.inventory.stock + v_received
      returning stock into v_balance;

      insert into public.stock_movements (variant_id, warehouse_id, type, reason, document_ref, quantity, resulting_balance, user_id)
      values ((v_item ->> 'variant_id')::uuid, p_warehouse_id, 'entrada', 'compra', p_receipt_id::text, v_received, coalesce(v_balance, 0), p_user_id);
    end if;

    update public.goods_receipt_items
      set received_qty = v_received
      where receipt_id = p_receipt_id and variant_id = (v_item ->> 'variant_id')::uuid;
  end loop;

  select not exists (
    select 1 from public.goods_receipt_items
    where receipt_id = p_receipt_id and received_qty < requested_qty
  ) into v_all_received;

  update public.goods_receipts
    set status = case when v_all_received then 'recibido'::public.receipt_status else 'parcial'::public.receipt_status end,
        received_by = p_user_id
    where id = p_receipt_id;

  if v_all_received and v_purchase_id is not null then
    update public.purchases set status = 'recibida' where id = v_purchase_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Top productos vendidos (vista de reporte)
-- ---------------------------------------------------------------------------
create or replace view public.v_top_products as
select
  p.id as product_id,
  p.name as product,
  sum(si.quantity) as units,
  sum(si.line_total) as total
from public.sale_items si
join public.product_variants pv on pv.id = si.variant_id
join public.products p on p.id = pv.product_id
join public.sales s on s.id = si.sale_id
where s.status <> 'anulada'
group by p.id, p.name
order by units desc;

grant execute on function public.fn_next_receipt_number to authenticated;
grant execute on function public.fn_create_purchase to authenticated;
grant execute on function public.fn_approve_purchase to authenticated;
grant execute on function public.fn_receive_goods to authenticated;
