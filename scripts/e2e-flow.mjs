// scripts/e2e-flow.mjs
// Prueba end-to-end del flujo Trama contra Supabase real.
//
// Cubre: Compra -> Aprobacion -> Recepcion -> Stock/Kardex ->
//        Venta (efectivo y tarjeta) -> Caja/CxC -> Cobro -> Reportes -> RLS.
//
// Variables de entorno (o lee .env.local):
//   SUPABASE_URL, SUPABASE_ANON_KEY
//
// Uso:
//   node scripts/e2e-flow.mjs

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  const path = ".env.local";
  if (existsSync(path)) {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx === -1) continue;
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return {
    url: process.env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    anon: process.env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
    service: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

const { url, anon } = loadEnv();
if (!url || !anon) {
  console.error("Faltan SUPABASE_URL / SUPABASE_ANON_KEY (o VITE_* en .env.local).");
  process.exit(1);
}

let failures = 0;
function ok(label, cond, extra = "") {
  console.log(`${cond ? "✓" : "✗"} ${label}${extra ? " -> " + extra : ""}`);
  if (!cond) failures++;
}

function client() {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function login(c, email, password) {
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return data.user;
}

const USERS = {
  admin: ["admin@trama.pe", "admin123"],
  vendedor: ["vendedor@trama.pe", "vendedor123"],
  almacenero: ["almacenero@trama.pe", "almacen123"],
  contador: ["contador@trama.pe", "conta123"],
};

const cAdmin = client();
const cVend = client();
const cAlm = client();
const cCont = client();

const admin = await login(cAdmin, ...USERS.admin);
const vendedor = await login(cVend, ...USERS.vendedor);
await login(cAlm, ...USERS.almacenero);
await login(cCont, ...USERS.contador);
console.log("Sesiones: 4 roles autenticados\n");

const supplier = (await cAdmin.from("suppliers").select("id").limit(1).single()).data;
const variant = (await cAdmin.from("product_variants").select("id, sku").limit(1).single()).data;
const warehouse = (
  await cAdmin.from("warehouses").select("id, name").eq("name", "Almacén Principal").single()
).data;
const customer = (await cAdmin.from("customers").select("id").limit(1).single()).data;
const cashAccount = (
  await cAdmin
    .from("accounts")
    .select("id, balance")
    .eq("type", "caja")
    .order("created_at")
    .limit(1)
    .single()
).data;

console.log("=== FLUJO COMPRA -> RECEPCION -> STOCK ===");
const stockBefore =
  (
    await cAdmin
      .from("inventory")
      .select("stock")
      .eq("variant_id", variant.id)
      .eq("warehouse_id", warehouse.id)
      .maybeSingle()
  ).data?.stock ?? 0;
console.log(`stock inicial ${variant.sku} = ${stockBefore}`);

const createRes = await cAdmin.rpc("fn_create_purchase", {
  p_supplier_id: supplier.id,
  p_created_by: admin.id,
  p_items: [{ variant_id: variant.id, quantity: 5, unit_cost: 30 }],
  p_igv_rate: 0.18,
  p_notes: "E2E test",
});
ok("fn_create_purchase", !createRes.error, createRes.error?.message);
const purchaseId = createRes.data;

const purchase = (await cAdmin.from("purchases").select("*").eq("id", purchaseId).single()).data;
ok(
  "OC totales reales",
  purchase.subtotal === 150 && purchase.igv === 27 && purchase.total === 177,
  `subtotal=${purchase.subtotal} igv=${purchase.igv} total=${purchase.total}`,
);
const purchaseItems = (
  await cAdmin.from("purchase_items").select("*").eq("purchase_id", purchaseId)
).data;
ok("OC con items", purchaseItems.length === 1, `items=${purchaseItems.length}`);

const approveRes = await cAdmin.rpc("fn_approve_purchase", {
  p_purchase_id: purchaseId,
  p_user_id: admin.id,
});
ok("fn_approve_purchase", !approveRes.error, approveRes.error?.message);
const receiptId = approveRes.data;

const receipt = (await cAdmin.from("goods_receipts").select("*").eq("id", receiptId).single()).data;
ok("recepcion pendiente creada", receipt.status === "pendiente", receipt.code);
const recItems = (await cAdmin.from("goods_receipt_items").select("*").eq("receipt_id", receiptId))
  .data;
ok(
  "recepcion con items",
  recItems.length === 1 && recItems[0].requested_qty === 5,
  `requested=${recItems[0]?.requested_qty}`,
);
const payable = (
  await cAdmin.from("payables").select("*").eq("purchase_id", purchaseId).maybeSingle()
).data;
ok("CxP creada al aprobar", !!payable && Number(payable.total) === 177, payable?.code);

const receiveRes = await cAdmin.rpc("fn_receive_goods", {
  p_receipt_id: receiptId,
  p_warehouse_id: warehouse.id,
  p_user_id: admin.id,
  p_items: recItems.map((it) => ({
    variant_id: it.variant_id,
    requested_qty: it.requested_qty,
    received_qty: it.requested_qty,
  })),
});
ok("fn_receive_goods", !receiveRes.error, receiveRes.error?.message);

const stockAfter = (
  await cAdmin
    .from("inventory")
    .select("stock")
    .eq("variant_id", variant.id)
    .eq("warehouse_id", warehouse.id)
    .single()
).data.stock;
ok("stock +5", stockAfter === stockBefore + 5, `${stockBefore} -> ${stockAfter}`);
const compMov = (await cAdmin.from("stock_movements").select("*").eq("document_ref", receiptId))
  .data;
ok(
  "kardex compra",
  compMov.length === 1 && compMov[0].reason === "compra",
  `qty=${compMov[0]?.quantity}`,
);
ok(
  "recepcion recibido",
  (await cAdmin.from("goods_receipts").select("status").eq("id", receiptId).single()).data
    .status === "recibido",
);
ok(
  "OC recibida",
  (await cAdmin.from("purchases").select("status").eq("id", purchaseId).single()).data.status ===
    "recibida",
);

console.log("\n=== FLUJO VENTA EFECTIVO -> CAJA ===");
const cajaBefore = (
  await cAdmin.from("accounts").select("balance").eq("id", cashAccount.id).single()
).data.balance;
const saleCash = await cVend.rpc("fn_register_sale", {
  p_customer_id: customer.id,
  p_seller_id: vendedor.id,
  p_warehouse_id: warehouse.id,
  p_receipt_type: "boleta",
  p_receipt_number: null,
  p_payment_method: "efectivo",
  p_items: [{ variant_id: variant.id, quantity: 1, unit_price: 100 }],
  p_igv_rate: 0.18,
  p_account_id: cashAccount.id,
});
ok("venta efectivo", !saleCash.error, saleCash.error?.message);
const sale = (await cAdmin.from("sales").select("*").eq("id", saleCash.data).single()).data;
ok(
  "receipt_number correlativo",
  !!sale.receipt_number && sale.receipt_number.startsWith("B001-"),
  sale.receipt_number,
);
ok("venta pagada", sale.status === "pagada");
const cajaAfter = (
  await cAdmin.from("accounts").select("balance").eq("id", cashAccount.id).single()
).data.balance;
ok(
  "caja +total venta",
  Number(cajaAfter) === Number(cajaBefore) + Number(sale.total),
  `${cajaBefore} -> ${cajaAfter}`,
);
const cashMov = (await cAdmin.from("account_movements").select("*").eq("reference", sale.code))
  .data;
ok(
  "movimiento ingreso caja",
  cashMov.length === 1 && cashMov[0].type === "ingreso",
  `S/ ${cashMov[0]?.amount}`,
);
const stockVenta1 = (
  await cAdmin
    .from("inventory")
    .select("stock")
    .eq("variant_id", variant.id)
    .eq("warehouse_id", warehouse.id)
    .single()
).data.stock;
ok("stock -1 por venta", stockVenta1 === stockAfter - 1, `${stockAfter} -> ${stockVenta1}`);

console.log("\n=== FLUJO VENTA TARJETA -> CxC -> COBRO ===");
const saleCard = await cVend.rpc("fn_register_sale", {
  p_customer_id: customer.id,
  p_seller_id: vendedor.id,
  p_warehouse_id: warehouse.id,
  p_receipt_type: "factura",
  p_receipt_number: null,
  p_payment_method: "tarjeta",
  p_items: [{ variant_id: variant.id, quantity: 2, unit_price: 50 }],
  p_igv_rate: 0.18,
  p_account_id: null,
});
ok("venta tarjeta", !saleCard.error, saleCard.error?.message);
const saleCardRow = (await cAdmin.from("sales").select("*").eq("id", saleCard.data).single()).data;
ok("venta tarjeta pendiente", saleCardRow.status === "pendiente");
ok(
  "receipt factura correlativo",
  !!saleCardRow.receipt_number && saleCardRow.receipt_number.startsWith("F001-"),
  saleCardRow.receipt_number,
);
const cxc = (
  await cAdmin.from("receivables").select("*").eq("sale_id", saleCard.data).maybeSingle()
).data;
ok(
  "CxC creada por venta tarjeta",
  !!cxc && Number(cxc.balance) === Number(saleCardRow.total),
  `${cxc?.code} S/ ${cxc?.balance}`,
);

const cajaBeforeCobro = (
  await cAdmin.from("accounts").select("balance").eq("id", cashAccount.id).single()
).data.balance;
const payRes = await cCont.rpc("fn_register_payment", {
  p_receivable_id: cxc.id,
  p_payable_id: null,
  p_amount: Number(cxc.balance),
  p_method: "transferencia",
  p_reference: "COBRO-E2E",
  p_account_id: cashAccount.id,
  p_user_id: null,
});
ok("fn_register_payment (cobro)", !payRes.error, payRes.error?.message);
const cxcAfter = (await cAdmin.from("receivables").select("*").eq("id", cxc.id).single()).data;
ok(
  "CxC cobrada saldo 0",
  Number(cxcAfter.balance) === 0 && cxcAfter.status === "cobrada",
  `balance=${cxcAfter.balance} status=${cxcAfter.status}`,
);
const cajaAfterCobro = (
  await cAdmin.from("accounts").select("balance").eq("id", cashAccount.id).single()
).data.balance;
ok(
  "caja +cobro",
  Number(cajaAfterCobro) === Number(cajaBeforeCobro) + Number(cxc.balance),
  `${cajaBeforeCobro} -> ${cajaAfterCobro}`,
);

console.log("\n=== VISTAS DE REPORTE ===");
for (const [view, label] of [
  ["v_top_products", "top productos"],
  ["v_sales_by_category", "ventas por categoria"],
  ["v_daily_sales", "ventas diarias"],
  ["v_receivables_aging", "aging CxC"],
  ["v_payables_aging", "aging CxP"],
]) {
  const { data, error } = await cAdmin.from(view).select("*");
  ok(
    `${view} (${label})`,
    !error && Array.isArray(data),
    error?.message ?? `filas=${data?.length}`,
  );
}

console.log("\n=== RLS POR ROL ===");
const almPay = await cAlm.from("payables").select("id");
ok("almacenero NO ve payables", (almPay.data ?? []).length === 0, `filas=${almPay.data?.length}`);
const almRecv = await cAlm.from("receivables").select("id");
ok(
  "almacenero NO ve receivables",
  (almRecv.data ?? []).length === 0,
  `filas=${almRecv.data?.length}`,
);
const vendPay = await cVend.from("payables").select("id");
ok("vendedor NO ve payables", (vendPay.data ?? []).length === 0, `filas=${vendPay.data?.length}`);
const contStockWrite = await cCont.from("stock_adjustments").insert({
  code: "X",
  variant_id: variant.id,
  warehouse_id: warehouse.id,
  type: "entrada",
  quantity: 1,
  reason: "otro",
});
ok("contador NO escribe stock_adjustments", !!contStockWrite.error, contStockWrite.error?.code);
const vendProducts = await cVend.from("products").select("id");
ok(
  "vendedor SI ve productos",
  (vendProducts.data ?? []).length > 0,
  `filas=${vendProducts.data?.length}`,
);

console.log("\n=== ADMIN: CREAR / ELIMINAR USUARIO ===");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || loadEnv().service;
if (!serviceKey) {
  ok("SUPABASE_SERVICE_ROLE_KEY disponible", false, "sin key: no se prueba crear usuario");
} else {
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const testEmail = `e2e-${Date.now()}@trama.pe`;

  const created = await admin.auth.admin.createUser({
    email: testEmail,
    password: "temp12345",
    email_confirm: true,
    user_metadata: { full_name: "Usuario E2E", role: "almacenero" },
  });
  const newId = created.data?.user?.id;
  ok("crear usuario (auth.admin)", !created.error && !!newId, created.error?.message);
  if (!newId) {
    console.log(`\n${failures} fallo(s) (abortado tras fallo de creacion)`);
    process.exit(1);
  }

  await admin
    .from("profiles")
    .upsert(
      { id: newId, email: testEmail, full_name: "Usuario E2E", role: "almacenero" },
      { onConflict: "id" },
    );
  const newProfile = (await admin.from("profiles").select("role").eq("id", newId).single()).data;
  ok("perfil con rol asignado", newProfile?.role === "almacenero", newProfile?.role);

  const loginNew = createClient(url, anon, { auth: { persistSession: false } });
  const loginRes = await loginNew.auth.signInWithPassword({
    email: testEmail,
    password: "temp12345",
  });
  ok("el usuario nuevo puede iniciar sesion", !loginRes.error, loginRes.error?.message);

  const delRes = await admin.auth.admin.deleteUser(newId);
  ok("eliminar usuario (auth.admin)", !delRes.error, delRes.error?.message);
  const gone = await admin.from("profiles").select("id").eq("id", newId).maybeSingle();
  ok("perfil eliminado en cascada", gone.data === null, `filas=${gone.data ? 1 : 0}`);
}

console.log(`\n${failures === 0 ? "TODO OK" : failures + " fallo(s)"}`);
process.exit(failures === 0 ? 0 : 1);
