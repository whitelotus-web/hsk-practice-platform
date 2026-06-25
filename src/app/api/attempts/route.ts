import { getCurrentUser } from "@/lib/server/auth";
import { getPool, query } from "@/lib/server/db";
import { fail, getNumber, getString, handleRouteError, ok, parseJson } from "@/lib/server/http";

export const runtime = "nodejs";

async function resolveQuestionId(questionId: string, externalQuestionId: string) {
  if (questionId) return questionId;
  if (!externalQuestionId) return "";

  const result = await query<{ id: string }>(
    "select id from questions where external_id = $1 limit 1",
    [externalQuestionId],
  );

  return result.rows[0]?.id ?? "";
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "Please sign in first.");

    const result = await query(
      `select a.id, a.status, a.score, a.started_at, a.submitted_at,
              ps.mode as practice_mode, me.title as mock_exam_title,
              count(aa.id) as answer_count
       from attempts a
       left join practice_sets ps on ps.id = a.practice_set_id
       left join mock_exams me on me.id = a.mock_exam_id
       left join answer_attempts aa on aa.attempt_id = a.id
       where a.user_id = $1
       group by a.id, ps.mode, me.title
       order by a.started_at desc
       limit 50`,
      [user.id],
    );

    return ok({ attempts: result.rows });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "Please sign in first.");

    const { body, error } = await parseJson(request);
    if (error) return error;

    const attemptId = getString(body, "attemptId");
    const questionId = await resolveQuestionId(
      getString(body, "questionId"),
      getString(body, "externalQuestionId"),
    );
    const mode = getString(body, "mode") || "practice";
    const answer = body.answer ?? getString(body, "answer");
    const isCorrect = typeof body.isCorrect === "boolean" ? body.isCorrect : null;
    const confidence = getNumber(body, "confidence");
    const durationSeconds = getNumber(body, "durationSeconds");

    if (!questionId) {
      return fail(400, "BAD_REQUEST", "A valid questionId or externalQuestionId is required.");
    }

    const client = await getPool().connect();
    try {
      await client.query("begin");

      let activeAttemptId = attemptId;
      if (!activeAttemptId) {
        const practiceSetResult = await client.query<{ id: string }>(
          "insert into practice_sets (user_id, mode) values ($1, $2) returning id",
          [user.id, mode],
        );

        const attemptResult = await client.query<{ id: string }>(
          `insert into attempts (user_id, practice_set_id, status)
           values ($1, $2, 'in_progress')
           returning id`,
          [user.id, practiceSetResult.rows[0].id],
        );
        activeAttemptId = attemptResult.rows[0].id;
      }

      await client.query(
        `insert into answer_attempts
          (attempt_id, question_id, answer, is_correct, confidence, duration_seconds)
         values ($1, $2, $3::jsonb, $4, $5, $6)
         on conflict (attempt_id, question_id) do update set
          answer = excluded.answer,
          is_correct = excluded.is_correct,
          confidence = excluded.confidence,
          duration_seconds = excluded.duration_seconds,
          created_at = now()`,
        [
          activeAttemptId,
          questionId,
          JSON.stringify({ value: answer }),
          isCorrect,
          confidence,
          durationSeconds,
        ],
      );

      if (isCorrect === false) {
        await client.query(
          `insert into learner_repository_items
            (user_id, question_id, item_type, wrong_count, due_at)
           values ($1, $2, 'wrong_question', 1, now() + interval '1 day')
           on conflict (user_id, question_id, item_type) do update set
            wrong_count = learner_repository_items.wrong_count + 1,
            due_at = now() + interval '1 day'`,
          [user.id, questionId],
        );
      }

      await client.query("commit");

      return ok(
        {
          attemptId: activeAttemptId,
          questionId,
          saved: true,
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
