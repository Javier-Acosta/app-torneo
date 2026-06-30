import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

export function getRequiredPocketBaseEnv() {
  loadLocalEnv();

  const url = process.env.POCKETBASE_URL?.replace(/\/$/, "");
  const email = process.env.POCKETBASE_SUPERUSER_EMAIL ?? process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_SUPERUSER_PASSWORD ?? process.env.POCKETBASE_ADMIN_PASSWORD;

  const missing = [
    ["POCKETBASE_URL", url],
    ["POCKETBASE_SUPERUSER_EMAIL or POCKETBASE_ADMIN_EMAIL", email],
    ["POCKETBASE_SUPERUSER_PASSWORD or POCKETBASE_ADMIN_PASSWORD", password],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.map(([key]) => key).join(", ")}`);
  }

  return { url, email, password };
}
