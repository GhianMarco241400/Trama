-- 0006_inventory.sql
-- Almacenes, inventario, movimientos (kardex), ajustes y transferencias

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type public.warehouse_type not null default 'almacen',
  address text,
  status public.record_status not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger warehouses_set_updated_at
  before update on public.warehouses
  for each row execute function public.set_updated_at();

-- FK diferida de sales hacia warehouses
alter table public.sales
  add constraint sales_warehouse_id_fkey
  foreign key (warehouse_id) references public.warehouses (id) on delete set null;

create index sales_warehouse_id_idx on public.sales (warehouse_id);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  updated_at timestamptz not null default now(),
  unique (variant_id, warehouse_id)
);

create index inventory_variant_id_idx on public.inventory (variant_id);
create index inventory_warehouse_id_idx on public.inventory (warehouse_id);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  moved_at timestamptz not null default now(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  warehouse_id uuid not null references public.warehouses (id) on delete restrict,
  type public.movement_type not null,
  reason public.movement_reason not null,
  document_ref text,
  quantity integer not null check (quantity > 0),
  resulting_balance integer not null default 0,
  user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index stock_movements_variant_id_idx on public.stock_movements (variant_id);
create index stock_movements_warehouse_id_idx on public.stock_movements (warehouse_id);
create index stock_movements_moved_at_idx on public.stock_movements (moved_at);
create index stock_movements_document_ref_idx on public.stock_movements (document_ref);

create table public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  adjusted_at timestamptz not null default now(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  warehouse_id uuid not null references public.warehouses (id) on delete restrict,
  type public.movement_type not null,
  quantity integer not null check (quantity > 0),
  reason public.adjustment_reason not null,
  user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index stock_adjustments_variant_id_idx on public.stock_adjustments (variant_id);
create index stock_adjustments_warehouse_id_idx on public.stock_adjustments (warehouse_id);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  transfered_at timestamptz not null default now(),
  origin_warehouse_id uuid not null references public.warehouses (id) on delete restrict,
  destination_warehouse_id uuid not null references public.warehouses (id) on delete restrict,
  status public.transfer_status not null default 'pendiente',
  requested_by uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transfers_origin_idx on public.transfers (origin_warehouse_id);
create index transfers_destination_idx on public.transfers (destination_warehouse_id);

create trigger transfers_set_updated_at
  before update on public.transfers
  for each row execute function public.set_updated_at();

create table public.transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfers (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index transfer_items_transfer_id_idx on public.transfer_items (transfer_id);
create index transfer_items_variant_id_idx on public.transfer_items (variant_id);
