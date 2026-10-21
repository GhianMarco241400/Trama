import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

export type Account = Tables<"accounts">;
export type AccountMovement = Tables<"account_movements">;
export type Receivable = Tables<"receivables">;
export type Payable = Tables<"payables">;
export type Payment = Tables<"payments">;
export type CashCount = Tables<"cash_counts">;

export type ReceivableDetail = Receivable & {
  customer: { id: string; name: string } | null;
};

export type PayableDetail = Payable & {
  supplier: { id: string; business_name: string } | null;
};

export type AccountMovementDetail = AccountMovement & {
  account: { id: string; name: string } | null;
};

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from("accounts").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createAccount(input: TablesInsert<"accounts">) {
  const { data, error } = await supabase.from("accounts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id: string, input: TablesUpdate<"accounts">) {
  const { data, error } = await supabase
    .from("accounts")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listAccountMovements(): Promise<AccountMovementDetail[]> {
  const { data, error } = await supabase
    .from("account_movements")
    .select("*, account:accounts(id, name)")
    .order("moved_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as unknown as AccountMovementDetail[];
}

export async function listReceivables(): Promise<ReceivableDetail[]> {
  const { data, error } = await supabase
    .from("receivables")
    .select("*, customer:customers(id, name)")
    .order("issue_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ReceivableDetail[];
}

export async function listPayables(): Promise<PayableDetail[]> {
  const { data, error } = await supabase
    .from("payables")
    .select("*, supplier:suppliers(id, business_name)")
    .order("issue_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PayableDetail[];
}

export async function registerPayment(input: {
  receivableId: string | null;
  payableId: string | null;
  amount: number;
  method: Tables<"payments">["method"];
  reference: string | null;
  accountId: string | null;
  userId: string | null;
}) {
  const { data, error } = await supabase.rpc("fn_register_payment", {
    p_receivable_id: input.receivableId,
    p_payable_id: input.payableId,
    p_amount: input.amount,
    p_method: input.method,
    p_reference: input.reference,
    p_account_id: input.accountId,
    p_user_id: input.userId,
  });
  if (error) throw error;
  return data as string;
}

export async function listCashCounts(): Promise<
  (CashCount & { account: { id: string; name: string } | null })[]
> {
  const { data, error } = await supabase
    .from("cash_counts")
    .select("*, account:accounts(id, name)")
    .order("counted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function createCashCount(input: TablesInsert<"cash_counts">) {
  const { data, error } = await supabase.from("cash_counts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCashCount(id: string, input: TablesUpdate<"cash_counts">) {
  const { data, error } = await supabase
    .from("cash_counts")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
