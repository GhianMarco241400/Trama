import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

export type Customer = Tables<"customers">;
export type Quotation = Tables<"quotations">;
export type Sale = Tables<"sales">;

export type QuotationWithCustomer = Quotation & {
  customer: { id: string; name: string } | null;
};

export type SaleWithRelations = Sale & {
  customer: { id: string; name: string } | null;
  seller: { id: string; full_name: string } | null;
};

export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCustomer(input: TablesInsert<"customers">) {
  const { data, error } = await supabase
    .from("customers")
    .insert(input)
    .select("id, name, document_type, document_number, customer_type, phone, email, address, status")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un cliente con ese DNI/RUC. El documento debe ser único.");
    }
    throw error;
  }
  return data;
}

export async function updateCustomer(id: string, input: TablesUpdate<"customers">) {
  const { data, error } = await supabase
    .from("customers")
    .update(input)
    .eq("id", id)
    .select("id, name, document_type, document_number, customer_type, phone, email, address, status")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un cliente con ese DNI/RUC. El documento debe ser único.");
    }
    throw error;
  }
  return data;
}

export async function listSales(): Promise<SaleWithRelations[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*, customer:customers(id, name), seller:profiles(id, full_name)")
    .order("sold_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SaleWithRelations[];
}

export type SaleItemInput = {
  variant_id: string;
  quantity: number;
  unit_price: number;
};

export async function registerSale(input: {
  customerId: string | null;
  sellerId: string | null;
  warehouseId: string | null;
  receiptType: Tables<"sales">["receipt_type"];
  receiptNumber: string | null;
  paymentMethod: Tables<"sales">["payment_method"];
  items: SaleItemInput[];
  igvRate?: number;
  accountId?: string | null;
}) {
  const { data, error } = await supabase.rpc("fn_register_sale", {
    p_customer_id: input.customerId,
    p_seller_id: input.sellerId,
    p_warehouse_id: input.warehouseId,
    p_receipt_type: input.receiptType,
    p_receipt_number: input.receiptNumber,
    p_payment_method: input.paymentMethod,
    p_items: input.items,
    p_igv_rate: input.igvRate ?? 0.18,
    p_account_id: input.accountId ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function nextReceiptNumber(
  receiptType: Tables<"sales">["receipt_type"],
): Promise<string> {
  const { data, error } = await supabase.rpc("fn_next_receipt_number", { p_type: receiptType });
  if (error) throw error;
  return data as string;
}

export type SalesByCategory = {
  category_id: string;
  category: string;
  total: number | null;
};

export type TopProduct = {
  product_id: string;
  product: string;
  units: number | null;
  total: number | null;
};

export async function listSalesByCategory(): Promise<SalesByCategory[]> {
  const { data, error } = await supabase.from("v_sales_by_category").select("*");
  if (error) throw error;
  return (data ?? []) as SalesByCategory[];
}

export async function listTopProducts(): Promise<TopProduct[]> {
  const { data, error } = await supabase.from("v_top_products").select("*").limit(5);
  if (error) throw error;
  return (data ?? []) as TopProduct[];
}

export async function listQuotations(): Promise<QuotationWithCustomer[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*, customer:customers(id, name)")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as QuotationWithCustomer[];
}

export async function createQuotation(input: TablesInsert<"quotations">, items: SaleItemInput[]) {
  const { data: quotation, error } = await supabase
    .from("quotations")
    .insert(input)
    .select()
    .single();
  if (error) throw error;

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("quotation_items").insert(
      items.map((i) => ({
        quotation_id: quotation.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.unit_price * i.quantity,
      })),
    );
    if (itemsError) throw itemsError;
  }

  return quotation;
}

export async function updateQuotationStatus(id: string, status: Tables<"quotations">["status"]) {
  const { error } = await supabase.from("quotations").update({ status }).eq("id", id);
  if (error) throw error;
}
