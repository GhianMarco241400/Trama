-- seed.sql
-- Datos de ejemplo para Trama (ejecutar en el SQL Editor o supabase db reset)
-- Los usuarios de auth se crean aparte (ver supabase/README.md).

-- ---------------------------------------------------------------------------
-- Configuracion
-- ---------------------------------------------------------------------------
insert into public.settings (id, business_name, ruc, phone, address, currency, igv_rate, timezone, receipt_format)
values (1, 'Trama Retail SAC', '20512345678', '(01) 456-7890', 'Av. Principal 123, Lima', 'PEN', 0.18, 'America/Lima', 'B001')
on conflict (id) do update set
  business_name = excluded.business_name,
  ruc = excluded.ruc,
  phone = excluded.phone,
  address = excluded.address;

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
insert into public.categories (id, name, description) values
  ('11111111-0000-0000-0000-000000000001', 'Polos', 'Polos y camisetas de algodón'),
  ('11111111-0000-0000-0000-000000000002', 'Camisas', 'Camisas formales y casuales'),
  ('11111111-0000-0000-0000-000000000003', 'Pantalones', 'Jeans, chinos y joggers'),
  ('11111111-0000-0000-0000-000000000004', 'Casacas', 'Casacas y abrigos'),
  ('11111111-0000-0000-0000-000000000005', 'Zapatillas', 'Zapatillas y calzado urbano'),
  ('11111111-0000-0000-0000-000000000006', 'Accesorios', 'Relojes y accesorios')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Proveedores
-- ---------------------------------------------------------------------------
insert into public.suppliers (id, ruc, business_name, contact_name, phone, email, address) values
  ('22222222-0000-0000-0000-000000000001', '20512345678', 'Textiles Perú SAC', 'Jorge Salas', '987654321', 'ventas@textilesperu.pe', 'Av. Los Telares 100, Lima'),
  ('22222222-0000-0000-0000-000000000002', '20399887766', 'Calzado Industrial SA', 'Carmen Díaz', '998877665', 'ventas@calzadoindustrial.pe', 'Av. Industria 250, Lima'),
  ('22222222-0000-0000-0000-000000000003', '20455667788', 'Accesorios Moda EIRL', 'Luis Paredes', '977665544', 'contacto@accesoriosmoda.pe', 'Jr. Comercio 45, Lima'),
  ('22222222-0000-0000-0000-000000000004', '20112233445', 'Hilos y Telas del Norte', 'Carmen Díaz', '988776655', 'compras@hilostelas.pe', 'Av. Norte 890, Trujillo')
on conflict (ruc) do nothing;

-- ---------------------------------------------------------------------------
-- Almacenes / tiendas
-- ---------------------------------------------------------------------------
insert into public.warehouses (id, name, type, address) values
  ('33333333-0000-0000-0000-000000000001', 'Almacén Principal', 'almacen', 'Av. Principal 123, Lima'),
  ('33333333-0000-0000-0000-000000000002', 'Almacén Secundario', 'almacen', 'Av. Secundaria 456, Lima'),
  ('33333333-0000-0000-0000-000000000003', 'Tienda Miraflores', 'tienda', 'Av. Larco 789, Miraflores'),
  ('33333333-0000-0000-0000-000000000004', 'Tienda San Isidro', 'tienda', 'Av. Javier Prado 100, San Isidro')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Productos y variantes (24 productos, 1 variante por talla base para demo)
-- ---------------------------------------------------------------------------
-- Los UUID de productos y variantes son deterministas para poder referenciarlos.
insert into public.products (id, sku, name, category_id, supplier_id, base_price) values
  ('44444444-0000-0000-0000-000000000001', 'POL-001', 'Polo Básico Algodón', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 49.90),
  ('44444444-0000-0000-0000-000000000002', 'POL-002', 'Polo Oversize Rayas', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 69.90),
  ('44444444-0000-0000-0000-000000000003', 'POL-003', 'Polo Piqué Cuello Camisero', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 79.90),
  ('44444444-0000-0000-0000-000000000004', 'POL-004', 'Polo Manga Larga Gráfico', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 89.90),
  ('44444444-0000-0000-0000-000000000005', 'CAM-001', 'Camisa Oxford Lino', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 119.90),
  ('44444444-0000-0000-0000-000000000006', 'CAM-002', 'Camisa Cuadros Franela', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 109.90),
  ('44444444-0000-0000-0000-000000000007', 'CAM-003', 'Camisa Denim Slim', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 129.90),
  ('44444444-0000-0000-0000-000000000008', 'CAM-004', 'Camisa Manga Corta Blanca', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 99.90),
  ('44444444-0000-0000-0000-000000000009', 'PAN-001', 'Jean Recto Índigo', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 159.90),
  ('44444444-0000-0000-0000-000000000010', 'PAN-002', 'Chino Slim Arena', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 139.90),
  ('44444444-0000-0000-0000-000000000011', 'PAN-003', 'Jean Skinny Negro', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 149.90),
  ('44444444-0000-0000-0000-000000000012', 'PAN-004', 'Jogger Urbano Gris', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 129.90),
  ('44444444-0000-0000-0000-000000000013', 'CAS-001', 'Casaca Denim Clásica', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 219.90),
  ('44444444-0000-0000-0000-000000000014', 'CAS-002', 'Casaca Cortaviento', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 199.90),
  ('44444444-0000-0000-0000-000000000015', 'CAS-003', 'Casaca Bomber Negro', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 239.90),
  ('44444444-0000-0000-0000-000000000016', 'CAS-004', 'Casaca Acolchada Verde', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 259.90),
  ('44444444-0000-0000-0000-000000000017', 'ZAP-001', 'Zapatilla Urbana Trama', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 249.90),
  ('44444444-0000-0000-0000-000000000018', 'ZAP-002', 'Zapatilla Runner Lite', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 279.90),
  ('44444444-0000-0000-0000-000000000019', 'ZAP-003', 'Zapatilla Trail Pro', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 289.90),
  ('44444444-0000-0000-0000-000000000020', 'ZAP-004', 'Zapatilla Skate Clásica', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 219.90),
  ('44444444-0000-0000-0000-000000000021', 'ACC-001', 'Reloj Minimal Negro', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 189.90),
  ('44444444-0000-0000-0000-000000000022', 'ACC-002', 'Reloj Acero Plata', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 249.90),
  ('44444444-0000-0000-0000-000000000023', 'ACC-003', 'Reloj Cuero Marrón', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 209.90),
  ('44444444-0000-0000-0000-000000000024', 'ACC-004', 'Reloj Deportivo Negro', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000003', 169.90)
on conflict (sku) do nothing;

-- Variante base por producto (talla M, color principal)
insert into public.product_variants (id, product_id, sku, size, color_name, color_hex, image_url)
select
  ('55555555-0000-0000-0000-' || lpad(row_number() over (order by p.sku)::text, 12, '0'))::uuid,
  p.id,
  p.sku || '-M',
  'M',
  'Estándar',
  '#1d1d1d',
  case p.sku
    when 'POL-001' then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'POL-002' then 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'POL-003' then 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'POL-004' then 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAM-001' then 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAM-002' then 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAM-003' then 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAM-004' then 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'PAN-001' then 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'PAN-002' then 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'PAN-003' then 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'PAN-004' then 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAS-001' then 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAS-002' then 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAS-003' then 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'CAS-004' then 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ZAP-001' then 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ZAP-002' then 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ZAP-003' then 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ZAP-004' then 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ACC-001' then 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ACC-002' then 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ACC-003' then 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop&q=80&fm=jpg'
    when 'ACC-004' then 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&h=600&fit=crop&q=80&fm=jpg'
    else null
  end
from public.products p
on conflict (sku) do nothing;

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------
insert into public.customers (document_type, document_number, customer_type, name, phone, email, address) values
  ('dni', '12345678', 'natural', 'Juan Pérez García', '987654321', 'juanperez@mail.com', 'Av. Larco 123, Miraflores'),
  ('ruc', '20123456789', 'juridica', 'Empresa Ejemplo SAC', '01-4567890', 'ventas@empresa.com', 'Av. Javier Prado 456, San Isidro'),
  ('dni', '87654321', 'natural', 'María García', '912345678', 'maria@mail.com', 'Calle Los Olivos 78, Surco'),
  ('ruc', '20987654321', 'juridica', 'Comercial San Isidro SAC', '01-7894561', 'compras@comercialsi.pe', 'Av. Arequipa 890, Lince')
on conflict (document_type, document_number) do nothing;

-- ---------------------------------------------------------------------------
-- Cuentas financieras
-- ---------------------------------------------------------------------------
insert into public.accounts (id, name, type, number, balance) values
  ('66666666-0000-0000-0000-000000000001', 'Caja Principal', 'caja', 'CAJA-01', 2450.00),
  ('66666666-0000-0000-0000-000000000002', 'Caja tienda Miraflores', 'caja', 'CAJA-02', 0),
  ('66666666-0000-0000-0000-000000000003', 'Banco de Crédito - Cta. Corriente', 'banco', 'BCP-193-xxxx', 8420.00),
  ('66666666-0000-0000-0000-000000000004', 'Interbank - Cta. Corriente', 'banco', 'IBK-200-xxxx', 4380.00)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Inventario inicial (todos los productos en Almacen Principal)
-- ---------------------------------------------------------------------------
insert into public.inventory (variant_id, warehouse_id, stock, min_stock)
select pv.id, '33333333-0000-0000-0000-000000000001', 20, 5
from public.product_variants pv
on conflict (variant_id, warehouse_id) do nothing;

-- ---------------------------------------------------------------------------
-- Compra + recepcion de ejemplo
-- ---------------------------------------------------------------------------
insert into public.purchases (id, code, supplier_id, status, subtotal, igv, total) values
  ('77777777-0000-0000-0000-000000000001', 'OC-001', '22222222-0000-0000-0000-000000000001', 'recibida', 4618.64, 831.36, 5450.00)
on conflict (code) do nothing;

insert into public.payables (code, supplier_id, purchase_id, receipt_number, issue_date, due_date, total, balance, status) values
  ('CXP-001', '22222222-0000-0000-0000-000000000001', '77777777-0000-0000-0000-000000000001', 'F001-00231', current_date - 10, current_date + 5, 5450.00, 5450.00, 'pendiente')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Venta + CxC de ejemplo
-- ---------------------------------------------------------------------------
insert into public.sales (id, code, sold_at, customer_id, receipt_type, receipt_number, payment_method, subtotal, igv, total, status, warehouse_id)
select
  '88888888-0000-0000-0000-000000000001', 'V-00001', now() - interval '2 days',
  c.id, 'factura', 'F001-00045', 'transferencia', 1101.44, 198.26, 1299.70, 'pendiente',
  '33333333-0000-0000-0000-000000000001'
from public.customers c
where c.document_number = '20123456789'
on conflict (code) do nothing;

insert into public.receivables (code, customer_id, sale_id, receipt_number, issue_date, due_date, total, balance, status)
select 'CXC-001', c.id, '88888888-0000-0000-0000-000000000001', 'F001-00045', current_date - 5, current_date + 2, 1299.70, 1299.70, 'pendiente'
from public.customers c where c.document_number = '20123456789'
on conflict (code) do nothing;
