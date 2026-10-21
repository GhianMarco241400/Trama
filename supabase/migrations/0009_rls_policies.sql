-- 0009_rls_policies.sql
-- Row Level Security: acceso segun rol del perfil

-- Helper: rol del usuario autenticado actual
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'administrador', false);
$$;

-- Activar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_items enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.transfers enable row level security;
alter table public.transfer_items enable row level security;
alter table public.accounts enable row level security;
alter table public.account_movements enable row level security;
alter table public.receivables enable row level security;
alter table public.payables enable row level security;
alter table public.payments enable row level security;
alter table public.cash_counts enable row level security;
alter table public.settings enable row level security;

-- profiles: cada usuario ve/edita su fila; admin todo
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy profiles_update on public.profiles
  for update using (auth.uid() = id or public.is_admin());
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Helper para tablas de lectura general para autenticados y escritura por rol
-- Catalogo: lectura para autenticados; escritura admin
create policy categories_select on public.categories for select using (auth.role() = 'authenticated');
create policy categories_write on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy suppliers_select on public.suppliers for select using (auth.role() = 'authenticated');
create policy suppliers_write on public.suppliers for all using (public.is_admin()) with check (public.is_admin());

create policy products_select on public.products for select using (auth.role() = 'authenticated');
create policy products_write on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy product_variants_select on public.product_variants for select using (auth.role() = 'authenticated');
create policy product_variants_write on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- Clientes: admin, vendedor y contador
create policy customers_select on public.customers for select
  using (public.current_role() in ('administrador', 'vendedor', 'contador'));
create policy customers_write on public.customers for all
  using (public.current_role() in ('administrador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'vendedor'));

-- Ventas
create policy sales_select on public.sales for select
  using (public.current_role() in ('administrador', 'vendedor', 'contador'));
create policy sales_write on public.sales for all
  using (public.current_role() in ('administrador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'vendedor'));

create policy sale_items_select on public.sale_items for select
  using (public.current_role() in ('administrador', 'vendedor', 'contador'));
create policy sale_items_write on public.sale_items for all
  using (public.current_role() in ('administrador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'vendedor'));

-- Cotizaciones
create policy quotations_select on public.quotations for select
  using (public.current_role() in ('administrador', 'vendedor', 'contador'));
create policy quotations_write on public.quotations for all
  using (public.current_role() in ('administrador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'vendedor'));

create policy quotation_items_select on public.quotation_items for select
  using (public.current_role() in ('administrador', 'vendedor', 'contador'));
create policy quotation_items_write on public.quotation_items for all
  using (public.current_role() in ('administrador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'vendedor'));

-- Compras / recepciones: admin y almacenero
create policy purchases_select on public.purchases for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy purchases_write on public.purchases for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy purchase_items_select on public.purchase_items for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy purchase_items_write on public.purchase_items for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy goods_receipts_select on public.goods_receipts for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy goods_receipts_write on public.goods_receipts for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy goods_receipt_items_select on public.goods_receipt_items for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy goods_receipt_items_write on public.goods_receipt_items for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

-- Inventario: lectura general; escritura admin y almacenero
create policy warehouses_select on public.warehouses for select using (auth.role() = 'authenticated');
create policy warehouses_write on public.warehouses for all using (public.is_admin()) with check (public.is_admin());

create policy inventory_select on public.inventory for select
  using (public.current_role() in ('administrador', 'almacenero', 'vendedor', 'contador'));
create policy inventory_write on public.inventory for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy stock_movements_select on public.stock_movements for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy stock_movements_write on public.stock_movements for all
  using (public.current_role() in ('administrador', 'almacenero', 'vendedor'))
  with check (public.current_role() in ('administrador', 'almacenero', 'vendedor'));

create policy stock_adjustments_select on public.stock_adjustments for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy stock_adjustments_write on public.stock_adjustments for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy transfers_select on public.transfers for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy transfers_write on public.transfers for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

create policy transfer_items_select on public.transfer_items for select
  using (public.current_role() in ('administrador', 'almacenero', 'contador'));
create policy transfer_items_write on public.transfer_items for all
  using (public.current_role() in ('administrador', 'almacenero'))
  with check (public.current_role() in ('administrador', 'almacenero'));

-- Tesoreria: admin y contador
create policy accounts_select on public.accounts for select
  using (public.current_role() in ('administrador', 'contador', 'vendedor'));
create policy accounts_write on public.accounts for all
  using (public.current_role() in ('administrador', 'contador'))
  with check (public.current_role() in ('administrador', 'contador'));

create policy account_movements_select on public.account_movements for select
  using (public.current_role() in ('administrador', 'contador', 'vendedor'));
create policy account_movements_write on public.account_movements for all
  using (public.current_role() in ('administrador', 'contador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'contador', 'vendedor'));

create policy receivables_select on public.receivables for select
  using (public.current_role() in ('administrador', 'contador', 'vendedor'));
create policy receivables_write on public.receivables for all
  using (public.current_role() in ('administrador', 'contador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'contador', 'vendedor'));

create policy payables_select on public.payables for select
  using (public.current_role() in ('administrador', 'contador'));
create policy payables_write on public.payables for all
  using (public.current_role() in ('administrador', 'contador'))
  with check (public.current_role() in ('administrador', 'contador'));

create policy payments_select on public.payments for select
  using (public.current_role() in ('administrador', 'contador', 'vendedor'));
create policy payments_write on public.payments for all
  using (public.current_role() in ('administrador', 'contador', 'vendedor'))
  with check (public.current_role() in ('administrador', 'contador', 'vendedor'));

create policy cash_counts_select on public.cash_counts for select
  using (public.current_role() in ('administrador', 'contador'));
create policy cash_counts_write on public.cash_counts for all
  using (public.current_role() in ('administrador', 'contador'))
  with check (public.current_role() in ('administrador', 'contador'));

-- Settings: lectura autenticados; escritura admin
create policy settings_select on public.settings for select using (auth.role() = 'authenticated');
create policy settings_write on public.settings for all using (public.is_admin()) with check (public.is_admin());
