import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/lib/database.types";

export type Warehouse = Tables<"warehouses">;
export type InventoryRow = Tables<"inventory">;
export type StockMovement = Tables<"stock_movements">;
export type StockAdjustment = Tables<"stock_adjustments">;
export type Transfer = Tables<"transfers">;

export type InventoryDetail = InventoryRow & {
  variant: {
    id: string;
    sku: string;
    size: string | null;
    color_name: string | null;
    color_hex: string | null;
    image_url: string | null;
    product: { id: string; name: string; category: { id: string; name: string } | null } | null;
  } | null;
  warehouse: { id: string; name: string } | null;
};

export async function listWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase.from("warehouses").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listInventory(): Promise<InventoryDetail[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select(
      "*, variant:product_variants(id, sku, size, color_name, color_hex, image_url, product:products(id, name, category:categories(id, name))), warehouse:warehouses(id, name)",
    )
    .order("stock");
  if (error) throw error;
  return (data ?? []) as unknown as InventoryDetail[];
}

export async function listStockMovements(): Promise<
  (StockMovement & {
    variant: { id: string; sku: string; product: { id: string; name: string } | null } | null;
    warehouse: { id: string; name: string } | null;
  })[]
> {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      "*, variant:product_variants(id, sku, product:products(id, name)), warehouse:warehouses(id, name)",
    )
    .order("moved_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as never;
}

export async function adjustStock(input: {
  code: string;
  variantId: string;
  warehouseId: string;
  type: Tables<"stock_adjustments">["type"];
  quantity: number;
  reason: Tables<"stock_adjustments">["reason"];
  userId: string | null;
  notes: string | null;
}) {
  const { error: adjError } = await supabase.from("stock_adjustments").insert({
    code: input.code,
    variant_id: input.variantId,
    warehouse_id: input.warehouseId,
    type: input.type,
    quantity: input.quantity,
    reason: input.reason,
    user_id: input.userId,
    notes: input.notes,
  });
  if (adjError) throw adjError;

  const delta = input.type === "entrada" ? input.quantity : -input.quantity;

  const { data: existing } = await supabase
    .from("inventory")
    .select("id, stock")
    .eq("variant_id", input.variantId)
    .eq("warehouse_id", input.warehouseId)
    .maybeSingle();

  let newStock = delta;
  if (existing) {
    newStock = existing.stock + delta;
    const { error } = await supabase
      .from("inventory")
      .update({ stock: newStock })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("inventory").insert({
      variant_id: input.variantId,
      warehouse_id: input.warehouseId,
      stock: Math.max(newStock, 0),
    });
    if (error) throw error;
  }

  const { error: movError } = await supabase.from("stock_movements").insert({
    variant_id: input.variantId,
    warehouse_id: input.warehouseId,
    type: input.type,
    reason: "ajuste",
    document_ref: input.code,
    quantity: input.quantity,
    resulting_balance: Math.max(newStock, 0),
    user_id: input.userId,
  });
  if (movError) throw movError;
}

export async function listTransfers(): Promise<
  (Transfer & {
    origin: { id: string; name: string } | null;
    destination: { id: string; name: string } | null;
  })[]
> {
  const { data, error } = await supabase
    .from("transfers")
    .select(
      "*, origin:warehouses!transfers_origin_warehouse_id_fkey(id, name), destination:warehouses!transfers_destination_warehouse_id_fkey(id, name)",
    )
    .order("transfered_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function createTransfer(
  input: TablesInsert<"transfers">,
  items: { variant_id: string; quantity: number }[],
) {
  const { data: transfer, error } = await supabase
    .from("transfers")
    .insert(input)
    .select()
    .single();
  if (error) throw error;

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("transfer_items").insert(
      items.map((i) => ({
        transfer_id: transfer.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
      })),
    );
    if (itemsError) throw itemsError;
  }

  return transfer;
}

export async function receiveTransfer(transferId: string, userId: string | null) {
  const { error } = await supabase.rpc("fn_transfer_stock", {
    p_transfer_id: transferId,
    p_user_id: userId,
  });
  if (error) throw error;
}

export {
  type Purchase,
  type PurchaseItem,
  type GoodsReceipt,
  type GoodsReceiptItem,
  listPurchases,
  listPurchaseItems,
  listGoodsReceipts,
  listGoodsReceiptItems,
  createPurchase,
  approvePurchase,
  receiveGoods,
} from "@/lib/api/purchasing";
