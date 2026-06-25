import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { requireDatabaseUrl, sslForDatabaseUrl } from "./db-env.mjs";

const { Pool } = pg;

const databaseUrl = requireDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslForDatabaseUrl(databaseUrl),
});

try {
  const schemaPath = path.join(process.cwd(), "docs", "postgres-schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database schema applied.");
} finally {
  await pool.end();
}
