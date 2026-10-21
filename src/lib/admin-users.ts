import { createServerFn } from "@tanstack/react-start";
import type { Role } from "./auth";

type CreateUserInput = {
  accessToken: string;
  email: string;
  password: string;
  fullName: string;
  role: Role;
};

type DeleteUserInput = {
  accessToken: string;
  userId: string;
};

async function serviceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const { serverEnv } = await import("./server-env");
  const url = serverEnv("SUPABASE_URL") ?? serverEnv("VITE_SUPABASE_URL");
  const serviceKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function anonClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const { serverEnv } = await import("./server-env");
  const url = serverEnv("SUPABASE_URL") ?? serverEnv("VITE_SUPABASE_URL");
  const anon = serverEnv("SUPABASE_ANON_KEY") ?? serverEnv("VITE_SUPABASE_ANON_KEY");
  if (!url || !anon) {
    throw new Error("Falta SUPABASE_URL o SUPABASE_ANON_KEY en el entorno del servidor.");
  }
  return createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function assertAdmin(accessToken: string): Promise<string> {
  if (!accessToken) throw new Error("No autorizado");
  const client = await anonClient();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Sesión inválida o expirada");
  const admin = await serviceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "administrador") throw new Error("Requiere rol administrador");
  return data.user.id;
}

export const adminCreateUser = createServerFn({ method: "POST" })
  .validator((data: CreateUserInput) => data)
  .handler(async ({ data }) => {
    await assertAdmin(data.accessToken);
    const email = data.email.trim().toLowerCase();
    if (!email || !data.password || data.password.length < 6) {
      throw new Error("Correo y contraseña (mínimo 6 caracteres) son obligatorios");
    }

    const admin = await serviceClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, role: data.role },
    });
    if (error) throw new Error(error.message);
    const newUser = created.user;
    if (!newUser) throw new Error("No se pudo crear el usuario");

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: newUser.id,
        email,
        full_name: data.fullName,
        role: data.role,
      },
      { onConflict: "id" },
    );
    if (profileError) throw new Error(profileError.message);

    return { id: newUser.id, email };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .validator((data: DeleteUserInput) => data)
  .handler(async ({ data }) => {
    const callerId = await assertAdmin(data.accessToken);
    if (callerId === data.userId) throw new Error("No puedes eliminar tu propia cuenta");

    const admin = await serviceClient();
    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { id: data.userId };
  });
