import pg from "pg";
import { requireDatabaseUrl, sslForDatabaseUrl } from "./db-env.mjs";

const { Pool } = pg;

const databaseUrl = requireDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslForDatabaseUrl(databaseUrl),
});

try {
  const result = await pool.query(`
    select
      (select count(*)::int from users) as users,
      (select count(*)::int from hsk_levels) as levels,
      (select count(*)::int from skills) as skills,
      (select count(*)::int from questions) as questions,
      (select count(*)::int from vocab_items) as vocab_items,
      (select count(*)::int from subscription_plans) as plans,
      (select count(*)::int from questions where status = 'published') as published_questions
  `);

  console.log(JSON.stringify(result.rows[0], null, 2));
} finally {
  await pool.end();
}
