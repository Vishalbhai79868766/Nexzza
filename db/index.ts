import { env } from "cloudflare:workers";
export function getDatabase() {
  if (!env.DB) throw new Error("Application database is unavailable.");
  return env.DB;
}
