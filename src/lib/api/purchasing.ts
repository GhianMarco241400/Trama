import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

export type Purchase = Tables<"purchases">;
export type PurchaseItem = Tables<"purchase_items">;
export type GoodsReceipt = Tables<"goods_receipts">;
export type GoodsReceiptItem = Tables<"goods_receipt_items">;

export type PurchaseDetail = Purchase & {
  supplier: { id: string; business_name: string } | null;
  items: (PurchaseItem & {
    variant: { id: string; sku: string; product: { id: string; name: string } | null } | null;
  })[];
};

export type PurchaseItemInput = {
  variant_id: string;
  quantity: number;
  unit_cost: number;
};

export type GoodsReceiptDetail = GoodsReceipt & {
  purchase: { id: string; code: string } | null;
  supplier: { id: string; business_name: string } | null;
  items: (GoodsReceiptItem & {
    variant: { id: string; sku: string; product: { id: string; name: string } | null } | null;
  })[];
};

export async function listPurchases(): Promise<
  (Purchase & { supplier: { id: string; business_name: string } | null })[]
> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*, supplier:suppliers(id, business_name)")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function listPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
  const { data, error } = await supabase
    .from("purchase_items")
    .select("*")
    .eq("purchase_id", purchaseId);
  if (error) throw error;
  return data ?? [];
}

export async function createPurchase(input: {
  supplierId: string;
  createdBy: string | null;
  items: PurchaseItemInput[];
  igvRate?: number;
  notes?: string | null;
  issuedAt?: string | undefined;
}) {
  const { data, error } = await supabase.rpc("fn_create_purchase", {
    p_supplier_id: input.supplierId,
    p_created_by: input.createdBy,
    p_items: input.items,
    p_igv_rate: input.igvRate ?? 0.18,
    p_notes: input.notes ?? null,
    ...(input.issuedAt ? { p_issued_at: input.issuedAt } : {}),
  });
  if (error) throw error;
  return data as string;
}

export async function approvePurchase(
  purchaseId: string,
  userId: string | null,
  dueDate?: string | null,
) {
  const { data, error } = await supabase.rpc("fn_approve_purchase", {
    p_purchase_id: purchaseId,
    p_user_id: userId,
    p_due_date: dueDate ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function listGoodsReceipts(): Promise<
  (GoodsReceipt & {
    purchase: { id: string; code: string } | null;
    supplier: { id: string; business_name: string } | null;
  })[]
> {
  const { data, error } = await supabase
    .from("goods_receipts")
    .select("*, purchase:purchases(id, code), supplier:suppliers(id, business_name)")
    .order("received_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function listGoodsReceiptItems(receiptId: string): Promise<
  (GoodsReceiptItem & {
    variant: { id: string; sku: string; product: { id: string; name: string } | null } | null;
  })[]
> {
  const { data, error } = await supabase
    .from("goods_receipt_items")
    .select("*, variant:product_variants(id, sku, product:products(id, name))")
    .eq("receipt_id", receiptId);
  if (error) throw error;
  return (data ?? []) as never;
}

export async function receiveGoods(input: {
  receiptId: string;
  warehouseId: string;
  userId: string | null;
  items: { variant_id: string; requested_qty: number; received_qty: number }[];
}) {
  const { error } = await supabase.rpc("fn_receive_goods", {
    p_receipt_id: input.receiptId,
    p_warehouse_id: input.warehouseId,
    p_user_id: input.userId,
    p_items: input.items,
  });
  if (error) throw error;
}
