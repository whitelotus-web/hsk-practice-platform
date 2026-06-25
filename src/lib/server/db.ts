import { Pool, type QueryResultRow } from "pg";
import { hasDatabase, serverConfig } from "./config";

let pool: Pool | undefined;

export function getPool() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool ??= new Pool({
    connectionString: serverConfig.databaseUrl,
    max: 10,
    ssl: serverConfig.databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const result = await getPool().query<T>(text, params);
  return result;
}

export async function pingDatabase() {
  if (!hasDatabase()) {
    return { ok: false, configured: false, latencyMs: null };
  }

  const startedAt = Date.now();
  await query("select 1 as ok");
  return { ok: true, configured: true, latencyMs: Date.now() - startedAt };
}
