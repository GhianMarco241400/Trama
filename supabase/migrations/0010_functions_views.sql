-- 0010_functions_views.sql
-- RPC transaccionales y vistas de reporte

-- Registrar venta: crea venta + items, descuenta stock, kardex y CxC
create or replace function public.fn_register_sale(
  p_customer_id uuid,
  p_seller_id uuid,
  p_warehouse_id uuid,
  p_receipt_type public.receipt_type,
  p_receipt_number text,
  p_payment_method public.payment_method,
  p_items jsonb,
  p_igv_rate numeric default 0.18
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
  v_item jsonb;
  v_balance integer;
begin
  v_code := 'V-' || lpad((coalesce((select count(*) from public.sales), 0) + 1)::text, 5, '0');

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
    v_code, p_customer_id, p_seller_id, p_warehouse_id, p_receipt_type, p_receipt_number,
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

  if p_payment_method <> 'efectivo' then
    insert into public.receivables (code, customer_id, sale_id, receipt_number, total, balance, status)
    values (
      'CXC-' || lpad((coalesce((select count(*) from public.receivables), 0) + 1)::text, 3, '0'),
      p_customer_id, v_sale_id, p_receipt_number, v_total, v_total, 'pendiente'
    );
  end if;

  return v_sale_id;
end;
$$;

-- Registrar pago/cobro: actualiza saldo, estado e inserta movimiento de cuenta
create or replace function public.fn_register_payment(
  p_receivable_id uuid,
  p_payable_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_reference text,
  p_account_id uuid,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_balance numeric(12, 2);
begin
  insert into public.payments (receivable_id, payable_id, amount, method, reference, account_id, user_id)
  values (p_receivable_id, p_payable_id, p_amount, p_method, p_reference, p_account_id, p_user_id)
  returning id into v_payment_id;

  if p_receivable_id is not null then
    update public.receivables
      set balance = greatest(balance - p_amount, 0),
          status = case when balance - p_amount <= 0 then 'cobrada'::public.receivable_status else status end
      where id = p_receivable_id
      returning balance into v_balance;

    insert into public.account_movements (account_id, description, type, amount, reference, user_id)
    values (p_account_id, 'Cobro a cliente', 'ingreso', p_amount, p_reference, p_user_id);
  end if;

  if p_payable_id is not null then
    update public.payables
      set balance = greatest(balance - p_amount, 0),
          status = case when balance - p_amount <= 0 then 'pagada'::public.payable_status else status end
      where id = p_payable_id
      returning balance into v_balance;

    insert into public.account_movements (account_id, description, type, amount, reference, user_id)
    values (p_account_id, 'Pago a proveedor', 'egreso', p_amount, p_reference, p_user_id);
  end if;

  if p_account_id is not null then
    update public.accounts
      set balance = balance + case when p_receivable_id is not null then p_amount else -p_amount end
      where id = p_account_id;
  end if;

  return v_payment_id;
end;
$$;

-- Transferir stock entre almacenes
create or replace function public.fn_transfer_stock(
  p_transfer_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origin uuid;
  v_destination uuid;
  v_item record;
  v_balance integer;
begin
  select origin_warehouse_id, destination_warehouse_id
    into v_origin, v_destination
    from public.transfers where id = p_transfer_id;

  for v_item in select variant_id, quantity from public.transfer_items where transfer_id = p_transfer_id
  loop
    update public.inventory
      set stock = stock - v_item.quantity
      where variant_id = v_item.variant_id and warehouse_id = v_origin
      returning stock into v_balance;

    insert into public.stock_movements (variant_id, warehouse_id, type, reason, document_ref, quantity, resulting_balance, user_id)
    values (v_item.variant_id, v_origin, 'salida', 'transferencia', p_transfer_id::text, v_item.quantity, coalesce(v_balance, 0), p_user_id);

    insert into public.inventory (variant_id, warehouse_id, stock, min_stock)
    values (v_item.variant_id, v_destination, v_item.quantity, 0)
    on conflict (variant_id, warehouse_id)
      do update set stock = public.inventory.stock + v_item.quantity
      returning stock into v_balance;

    insert into public.stock_movements (variant_id, warehouse_id, type, reason, document_ref, quantity, resulting_balance, user_id)
    values (v_item.variant_id, v_destination, 'entrada', 'transferencia', p_transfer_id::text, v_item.quantity, coalesce(v_balance, 0), p_user_id);
  end loop;

  update public.transfers set status = 'recibido' where id = p_transfer_id;
end;
$$;

-- Vistas de reporte
create or replace view public.v_daily_sales as
select
  date_trunc('day', sold_at)::date as day,
  count(*) as sale_count,
  sum(total) as total
from public.sales
where status <> 'anulada'
group by 1
order by 1;

create or replace view public.v_sales_by_category as
select
  c.id as category_id,
  c.name as category,
  sum(si.line_total) as total
from public.sale_items si
join public.product_variants pv on pv.id = si.variant_id
join public.products p on p.id = pv.product_id
join public.categories c on c.id = p.category_id
join public.sales s on s.id = si.sale_id
where s.status <> 'anulada'
group by c.id, c.name
order by total desc;

create or replace view public.v_receivables_aging as
select
  r.id,
  r.code,
  cu.name as customer,
  r.due_date,
  r.total,
  r.balance,
  r.status,
  case
    when r.balance <= 0 then 'cobrada'
    when r.status = 'vencida' then 'vencido'
    when r.due_date is not null and r.due_date <= current_date then 'vencido'
    when r.due_date is not null and r.due_date <= current_date + 7 then 'por_vencer'
    else 'corriente'
  end as aging_bucket
from public.receivables r
left join public.customers cu on cu.id = r.customer_id;

create or replace view public.v_payables_aging as
select
  p.id,
  p.code,
  s.business_name as supplier,
  p.due_date,
  p.total,
  p.balance,
  p.status,
  case
    when p.balance <= 0 then 'pagada'
    when p.status = 'vencida' then 'vencido'
    when p.due_date is not null and p.due_date <= current_date then 'vencido'
    when p.due_date is not null and p.due_date <= current_date + 7 then 'por_vencer'
    else 'corriente'
  end as aging_bucket
from public.payables p
left join public.suppliers s on s.id = p.supplier_id;

-- Permisos de ejecucion de RPC
grant execute on function public.fn_register_sale to authenticated;
grant execute on function public.fn_register_payment to authenticated;
grant execute on function public.fn_transfer_stock to authenticated;
