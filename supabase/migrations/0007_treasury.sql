-- 0007_treasury.sql
-- Cajas/bancos, movimientos de cuenta, CxC, CxP, pagos y arqueos

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type public.account_type not null default 'caja',
  number text,
  balance numeric(12, 2) not null default 0,
  status public.record_status not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

create table public.account_movements (
  id uuid primary key default gen_random_uuid(),
  moved_at timestamptz not null default now(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  description text,
  type public.account_entry_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  reference text,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index account_movements_account_id_idx on public.account_movements (account_id);
create index account_movements_moved_at_idx on public.account_movements (moved_at);

create table public.receivables (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  sale_id uuid references public.sales (id) on delete set null,
  receipt_number text,
  issue_date date not null default current_date,
  due_date date,
  total numeric(12, 2) not null default 0 check (total >= 0),
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  status public.receivable_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index receivables_customer_id_idx on public.receivables (customer_id);
create index receivables_sale_id_idx on public.receivables (sale_id);
create index receivables_status_idx on public.receivables (status);

create trigger receivables_set_updated_at
  before update on public.receivables
  for each row execute function public.set_updated_at();

create table public.payables (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  supplier_id uuid references public.suppliers (id) on delete set null,
  purchase_id uuid references public.purchases (id) on delete set null,
  receipt_number text,
  issue_date date not null default current_date,
  due_date date,
  total numeric(12, 2) not null default 0 check (total >= 0),
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  status public.payable_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payables_supplier_id_idx on public.payables (supplier_id);
create index payables_purchase_id_idx on public.payables (purchase_id);
create index payables_status_idx on public.payables (status);

create trigger payables_set_updated_at
  before update on public.payables
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  receivable_id uuid references public.receivables (id) on delete set null,
  payable_id uuid references public.payables (id) on delete set null,
  paid_at timestamptz not null default now(),
  amount numeric(12, 2) not null check (amount > 0),
  method public.payment_method not null default 'efectivo',
  reference text,
  account_id uuid references public.accounts (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (receivable_id is not null and payable_id is null)
    or (receivable_id is null and payable_id is not null)
  )
);

create index payments_receivable_id_idx on public.payments (receivable_id);
create index payments_payable_id_idx on public.payments (payable_id);

create table public.cash_counts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  counted_at timestamptz not null default now(),
  shift public.cash_shift not null default 'manana',
  account_id uuid not null references public.accounts (id) on delete restrict,
  user_id uuid references public.profiles (id) on delete set null,
  opening_amount numeric(12, 2) not null default 0,
  sales_amount numeric(12, 2) not null default 0,
  other_income numeric(12, 2) not null default 0,
  expenses numeric(12, 2) not null default 0,
  expected numeric(12, 2) not null default 0,
  counted numeric(12, 2) not null default 0,
  difference numeric(12, 2) not null default 0,
  status public.cash_count_status not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cash_counts_account_id_idx on public.cash_counts (account_id);

create trigger cash_counts_set_updated_at
  before update on public.cash_counts
  for each row execute function public.set_updated_at();
