-- 0008_settings.sql
-- Configuracion global (fila unica)

create table public.settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default 'Trama Retail SAC',
  ruc text,
  phone text,
  address text,
  currency text not null default 'PEN',
  igv_rate numeric(5, 4) not null default 0.1800 check (igv_rate >= 0 and igv_rate <= 1),
  timezone text not null default 'America/Lima',
  receipt_format text not null default 'B001',
  notify_critical_stock boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

insert into public.settings (id) values (1) on conflict (id) do nothing;
