# Supabase — Trama

Configuración backend (auth real + PostgreSQL) para el ERP Trama.

## Estructura

- `migrations/` — esquema SQL incremental (0001 → 0010).
- `seed.sql` — datos de ejemplo del dominio.

## Aplicar el esquema

### Opción A — Supabase CLI (recomendado)

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

### Opción B — SQL Editor del dashboard

Ejecuta en orden los archivos de `migrations/` (0001 → 0010) y luego `seed.sql`.

## Crear los usuarios de prueba

Los usuarios de `auth` **no** se crean con SQL plano desde el cliente (requieren `service_role`).
Créalos en el dashboard: **Authentication → Users → Add user** (marca "Auto Confirm User").

| Email               | Contraseña  | Rol           |
| ------------------- | ----------- | ------------- |
| admin@trama.pe      | admin123    | administrador |
| vendedor@trama.pe   | vendedor123 | vendedor      |
| almacenero@trama.pe | almacen123  | almacenero    |
| contador@trama.pe   | conta123    | contador      |

Al crear cada usuario, el trigger `handle_new_user` inserta automáticamente su fila en
`public.profiles`. Por defecto el rol es `vendedor`; para asignar el rol correcto,
en "Add user" agrega en **User Metadata**:

```json
{ "full_name": "Ana Torres", "role": "administrador" }
```

O bien, actualiza el rol después:

```sql
update public.profiles set role = 'administrador' where email = 'admin@trama.pe';
update public.profiles set role = 'vendedor' where email = 'vendedor@trama.pe';
update public.profiles set role = 'almacenero' where email = 'almacenero@trama.pe';
update public.profiles set role = 'contador' where email = 'contador@trama.pe';
```

## Variables de entorno

En `.env.local`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

## RPC disponibles

- `fn_register_sale(...)` — registra venta, descuenta stock, genera kardex y CxC.
- `fn_register_payment(...)` — registra cobro/pago, actualiza saldo y caja/bancos.
- `fn_transfer_stock(...)` — transfiere stock entre almacenes.
