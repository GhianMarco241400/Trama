import { readFileSync, existsSync } from "node:fs";

let loaded = false;

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

export function serverEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  if (!loaded) {
    loaded = true;
    for (const file of [".env.local", ".env"]) {
      const parsed = parseEnvFile(file);
      for (const [k, v] of Object.entries(parsed)) {
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
  return process.env[key];
}
