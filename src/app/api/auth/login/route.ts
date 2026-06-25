import { setSessionCookie } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { fail, getString, handleRouteError, ok, parseJson } from "@/lib/server/http";
import { verifyPassword } from "@/lib/server/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { body, error } = await parseJson(request);
    if (error) return error;

    const email = getString(body, "email").toLowerCase();
    const password = getString(body, "password");

    const result = await query<{
      id: string;
      email: string;
      password_hash: string | null;
      display_name: string;
      locale: string;
      role: string;
    }>(
      `select id, email, password_hash, display_name, locale, coalesce(role, 'learner') as role
       from users
       where email = $1
       limit 1`,
      [email],
    );

    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return fail(401, "UNAUTHORIZED", "Email or password is incorrect.");
    }

    const response = ok({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        locale: user.locale,
        role: user.role,
      },
    });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
