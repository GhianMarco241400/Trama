import { supabase } from "@/lib/supabase";
import { adminCreateUser, adminDeleteUser } from "@/lib/admin-users";
import type { Role } from "@/lib/auth";
import type { Tables, TablesUpdate } from "@/lib/database.types";

export type Profile = Tables<"profiles">;
export type Settings = Tables<"settings">;

async function currentAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesión no encontrada. Vuelve a iniciar sesión.");
  return token;
}

export async function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}) {
  const accessToken = await currentAccessToken();
  return adminCreateUser({ data: { ...input, accessToken } });
}

export async function deleteUser(userId: string) {
  const accessToken = await currentAccessToken();
  return adminDeleteUser({ data: { userId, accessToken } });
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(id: string, input: TablesUpdate<"profiles">) {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSettings(input: TablesUpdate<"settings">) {
  const { data, error } = await supabase
    .from("settings")
    .update(input)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}
