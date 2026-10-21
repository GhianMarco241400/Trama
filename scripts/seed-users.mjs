import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  console.error(
    'Ejecuta: $env:SUPABASE_URL="https://bzlprwqyxssvvbqxrhq.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="<service_role>"; bun run scripts/seed-users.mjs',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: "admin@trama.pe", password: "admin123", full_name: "Ana Torres", role: "administrador" },
  {
    email: "vendedor@trama.pe",
    password: "vendedor123",
    full_name: "Lucía Quispe",
    role: "vendedor",
  },
  {
    email: "almacenero@trama.pe",
    password: "almacen123",
    full_name: "Carlos Medina",
    role: "almacenero",
  },
  { email: "contador@trama.pe", password: "conta123", full_name: "María Rojas", role: "contador" },
];

const { data: existing } = await supabase.auth.admin.listUsers();
const byEmail = new Map((existing?.users ?? []).map((u) => [u.email, u.id]));

for (const user of users) {
  const existingId = byEmail.get(user.email);
  if (existingId) {
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    });
    if (error) {
      console.error(`✗ ${user.email}: ${error.message}`);
      continue;
    }
    await supabase
      .from("profiles")
      .upsert(
        { id: existingId, email: user.email, role: user.role, full_name: user.full_name },
        { onConflict: "id" },
      );
    console.log(`↻ ${user.email} actualizado (rol: ${user.role})`);
    continue;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name, role: user.role },
  });

  if (error) {
    console.error(`✗ ${user.email}: ${error.message}`);
    continue;
  }

  await supabase
    .from("profiles")
    .upsert(
      { id: data.user.id, email: user.email, role: user.role, full_name: user.full_name },
      { onConflict: "id" },
    );
  console.log(`✓ ${user.email} creado (rol: ${user.role})`);
}

console.log("Listo.");
