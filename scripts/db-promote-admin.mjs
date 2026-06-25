import pg from "pg";
import { requireDatabaseUrl, sslForDatabaseUrl } from "./db-env.mjs";

const { Pool } = pg;

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.trim() || "super_admin";
const allowedRoles = new Set(["learner", "teacher", "content_admin", "admin", "super_admin"]);

if (!email) {
  throw new Error("Usage: npm run db:promote-admin -- email@example.com [role]");
}

if (!allowedRoles.has(role)) {
  throw new Error(`Role must be one of: ${[...allowedRoles].join(", ")}`);
}

const databaseUrl = requireDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslForDatabaseUrl(databaseUrl),
});

try {
  const result = await pool.query(
    `update users
     set role = $2, updated_at = now()
     where email = $1
     returning id, email, display_name, locale, role`,
    [email, role],
  );

  if (!result.rows[0]) {
    throw new Error(`No user found for ${email}. Register or insert the user first.`);
  }

  console.log(JSON.stringify(result.rows[0], null, 2));
} finally {
  await pool.end();
}
