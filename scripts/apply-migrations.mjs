import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("Falta SUPABASE_DB_URL.");
  console.error(
    'Ejecuta: $env:SUPABASE_DB_URL="postgresql://postgres:<password>@db.bzlprwqyxssvvvbqxrhq.supabase.co:5432/postgres"; bun run scripts/apply-migrations.mjs',
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const targets = [
  ...files.map((f) => join(migrationsDir, f)),
  join(process.cwd(), "supabase", "seed.sql"),
];

await client.connect();
console.log("Conectado a Postgres.");

for (const file of targets) {
  const sql = readFileSync(file, "utf8");
  const name = file.split(/[\\/]/).pop();
  try {
    await client.query(sql);
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("Migraciones y seed aplicados.");
