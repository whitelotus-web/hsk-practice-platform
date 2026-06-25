import { getCurrentUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { fail, getNumber, getString, handleRouteError, ok, parseJson } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "Please sign in first.");

    const profile = await query(
      `select nationality, current_location, gender, age, test_goal, target_level,
              target_exam_date, membership_expires_at
       from learner_profiles
       where user_id = $1
       limit 1`,
      [user.id],
    );

    return ok({
      user,
      profile: profile.rows[0] ?? null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "Please sign in first.");

    const { body, error } = await parseJson(request);
    if (error) return error;

    const displayName = getString(body, "displayName");
    const locale = getString(body, "locale") || user.locale;
    const targetLevel = getNumber(body, "targetLevel");
    const testGoal = getString(body, "testGoal");
    const currentLocation = getString(body, "currentLocation");
    const nationality = getString(body, "nationality");

    if (displayName) {
      await query(
        `update users
         set display_name = $2, locale = $3, updated_at = now()
         where id = $1`,
        [user.id, displayName, locale],
      );
    }

    await query(
      `insert into learner_profiles
        (user_id, target_level, test_goal, current_location, nationality)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id) do update set
        target_level = coalesce(excluded.target_level, learner_profiles.target_level),
        test_goal = coalesce(nullif(excluded.test_goal, ''), learner_profiles.test_goal),
        current_location = coalesce(nullif(excluded.current_location, ''), learner_profiles.current_location),
        nationality = coalesce(nullif(excluded.nationality, ''), learner_profiles.nationality)`,
      [user.id, targetLevel, testGoal, currentLocation, nationality],
    );

    return GET();
  } catch (error) {
    return handleRouteError(error);
  }
}
