-- 0004_sales.sql
-- Clientes, ventas, cotizaciones

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  document_type public.document_type not null default 'dni',
  document_number text not null,
  customer_type public.customer_type not null default 'natural',
  name text not null,
  phone text,
  email text,
  address text,
  status public.record_status not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_type, document_number)
);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  sold_at timestamptz not null default now(),
  customer_id uuid references public.customers (id) on delete set null,
  seller_id uuid references public.profiles (id) on delete set null,
  warehouse_id uuid,
  receipt_type public.receipt_type not null default 'boleta',
  receipt_number text,
  payment_method public.payment_method not null default 'efectivo',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  igv numeric(12, 2) not null default 0 check (igv >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  status public.sale_status not null default 'pagada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sales_customer_id_idx on public.sales (customer_id);
create index sales_seller_id_idx on public.sales (seller_id);
create index sales_sold_at_idx on public.sales (sold_at);
create index sales_status_idx on public.sales (status);

create trigger sales_set_updated_at
  before update on public.sales
  for each row execute function public.set_updated_at();

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index sale_items_sale_id_idx on public.sale_items (sale_id);
create index sale_items_variant_id_idx on public.sale_items (variant_id);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  issued_at timestamptz not null default now(),
  customer_id uuid references public.customers (id) on delete set null,
  seller_id uuid references public.profiles (id) on delete set null,
  currency text not null default 'PEN',
  valid_until date,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  igv numeric(12, 2) not null default 0 check (igv >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  status public.quotation_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotations_customer_id_idx on public.quotations (customer_id);
create index quotations_seller_id_idx on public.quotations (seller_id);

create trigger quotations_set_updated_at
  before update on public.quotations
  for each row execute function public.set_updated_at();

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index quotation_items_quotation_id_idx on public.quotation_items (quotation_id);
create index quotation_items_variant_id_idx on public.quotation_items (variant_id);
