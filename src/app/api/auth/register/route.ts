import { setSessionCookie } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { fail, getNumber, getString, handleRouteError, ok, parseJson } from "@/lib/server/http";
import { hashPassword } from "@/lib/server/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { body, error } = await parseJson(request);
    if (error) return error;

    const email = getString(body, "email").toLowerCase();
    const password = getString(body, "password");
    const displayName = getString(body, "displayName") || email.split("@")[0];
    const locale = getString(body, "locale") || "vi";
    const targetLevel = getNumber(body, "targetLevel");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, "BAD_REQUEST", "Email is invalid.");
    }

    if (password.length < 8) {
      return fail(400, "BAD_REQUEST", "Password must contain at least 8 characters.");
    }

    const passwordHash = await hashPassword(password);
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("begin");
      const result = await client.query<{
        id: string;
        email: string;
        display_name: string;
        locale: string;
        role: string;
      }>(
        `insert into users (email, password_hash, display_name, locale, role)
         values ($1, $2, $3, $4, 'learner')
         returning id, email, display_name, locale, role`,
        [email, passwordHash, displayName, locale],
      );

      const user = result.rows[0];

      await client.query(
        `insert into learner_profiles (user_id, target_level)
         values ($1, $2)
         on conflict (user_id) do update set target_level = excluded.target_level`,
        [user.id, targetLevel],
      );

      await client.query("commit");

      const response = ok(
        {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            locale: user.locale,
            role: user.role,
          },
        },
        { status: 201 },
      );
      setSessionCookie(response, user.id);
      return response;
    } catch (error) {
      await client.query("rollback");
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        return fail(409, "CONFLICT", "Email is already registered.");
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
