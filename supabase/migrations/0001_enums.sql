-- 0001_enums.sql
-- Tipos enumerados del dominio Trama

create type public.user_role as enum ('administrador', 'vendedor', 'almacenero', 'contador');

create type public.record_status as enum ('activo', 'inactivo');

create type public.payment_method as enum ('efectivo', 'tarjeta', 'yape_plin', 'transferencia', 'cheque');

create type public.receipt_type as enum ('boleta', 'factura');

create type public.sale_status as enum ('pagada', 'pendiente', 'anulada');

create type public.quotation_status as enum ('pendiente', 'aprobada', 'vencida');

create type public.purchase_status as enum ('pendiente', 'aprobada', 'recibida', 'anulada');

create type public.receipt_status as enum ('pendiente', 'recibido', 'parcial');

create type public.transfer_status as enum ('pendiente', 'en_transito', 'recibido', 'anulado');

create type public.movement_type as enum ('entrada', 'salida');

create type public.movement_reason as enum ('venta', 'compra', 'ajuste', 'transferencia');

create type public.adjustment_reason as enum (
  'conteo_fisico',
  'producto_danado',
  'producto_vencido',
  'correccion_inventario',
  'otro'
);

create type public.warehouse_type as enum ('almacen', 'tienda');

create type public.account_type as enum ('caja', 'banco');

create type public.document_type as enum ('dni', 'ruc');

create type public.customer_type as enum ('natural', 'juridica');

create type public.account_entry_type as enum ('ingreso', 'egreso');

create type public.receivable_status as enum ('pendiente', 'vencida', 'cobrada');

create type public.payable_status as enum ('pendiente', 'vencida', 'pagada');

create type public.cash_count_status as enum ('cuadrado', 'con_diferencia', 'pendiente');

create type public.cash_shift as enum ('manana', 'tarde');
