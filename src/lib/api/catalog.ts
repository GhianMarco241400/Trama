import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductVariant = Tables<"product_variants">;
export type Supplier = Tables<"suppliers">;

export type ProductWithRelations = Product & {
  category: { id: string; name: string } | null;
  supplier: { id: string; business_name: string } | null;
  variants: ProductVariant[];
};

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: TablesInsert<"categories">) {
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: TablesUpdate<"categories">) {
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function listProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name), supplier:suppliers(id, business_name), variants:product_variants(*)",
    )
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function createProduct(input: TablesInsert<"products">) {
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: TablesUpdate<"products">) {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function createVariant(input: TablesInsert<"product_variants">) {
  const { data, error } = await supabase.from("product_variants").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase.from("suppliers").select("*").order("business_name");
  if (error) throw error;
  return data ?? [];
}

export async function createSupplier(input: TablesInsert<"suppliers">) {
  const { data, error } = await supabase.from("suppliers").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id: string, input: TablesUpdate<"suppliers">) {
  const { data, error } = await supabase
    .from("suppliers")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}
