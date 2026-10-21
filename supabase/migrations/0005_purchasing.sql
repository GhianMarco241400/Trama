-- 0005_purchasing.sql
-- Compras, items de compra, recepciones

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  issued_at timestamptz not null default now(),
  status public.purchase_status not null default 'pendiente',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  igv numeric(12, 2) not null default 0 check (igv >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_supplier_id_idx on public.purchases (supplier_id);
create index purchases_status_idx on public.purchases (status);

create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index purchase_items_purchase_id_idx on public.purchase_items (purchase_id);
create index purchase_items_variant_id_idx on public.purchase_items (variant_id);

create table public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  purchase_id uuid not null references public.purchases (id) on delete restrict,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  received_at timestamptz not null default now(),
  status public.receipt_status not null default 'pendiente',
  total numeric(12, 2) not null default 0 check (total >= 0),
  received_by uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goods_receipts_purchase_id_idx on public.goods_receipts (purchase_id);
create index goods_receipts_supplier_id_idx on public.goods_receipts (supplier_id);

create trigger goods_receipts_set_updated_at
  before update on public.goods_receipts
  for each row execute function public.set_updated_at();

create table public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.goods_receipts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  requested_qty integer not null default 0 check (requested_qty >= 0),
  received_qty integer not null default 0 check (received_qty >= 0),
  difference integer generated always as (received_qty - requested_qty) stored,
  created_at timestamptz not null default now()
);

create index goods_receipt_items_receipt_id_idx on public.goods_receipt_items (receipt_id);
create index goods_receipt_items_variant_id_idx on public.goods_receipt_items (variant_id);
