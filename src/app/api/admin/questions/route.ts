import { canManageContent, getCurrentUser } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { fail, getNumber, getString, handleRouteError, ok, parseJson } from "@/lib/server/http";

export const runtime = "nodejs";

const allowedSkills = new Set(["listening", "reading", "writing", "translation", "speaking"]);
const allowedStatuses = new Set(["draft", "review", "approved", "published"]);

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "Please sign in first.");
    if (!canManageContent(user.role)) {
      return fail(403, "FORBIDDEN", "Content admin permission is required.");
    }

    const { body, error } = await parseJson(request);
    if (error) return error;

    const level = getNumber(body, "level");
    const skill = getString(body, "skill");
    const externalId = getString(body, "externalId") || null;
    const prompt = getString(body, "prompt");
    const answer = getString(body, "answer");
    const explanation = getString(body, "analysis") || getString(body, "explanation");
    const grammar = getString(body, "grammar");
    const questionType = getString(body, "questionType") || "single";
    const sectionTitle = getString(body, "sectionTitle") || `Imported ${skill || "question"} section`;
    const sourceType = getString(body, "sourceType") || "original";
    const status = getString(body, "status") || "draft";
    const difficulty = getNumber(body, "difficulty") ?? 1;
    const options = getStringArray(body.options);

    if (!level || level < 1 || level > 9) {
      return fail(400, "BAD_REQUEST", "Level must be between HSK 1 and HSK 9.");
    }

    if (!allowedSkills.has(skill)) {
      return fail(400, "BAD_REQUEST", "Skill must be listening, reading, writing, translation or speaking.");
    }

    if (!prompt || !answer) {
      return fail(400, "BAD_REQUEST", "Prompt and answer are required.");
    }

    if (!allowedStatuses.has(status)) {
      return fail(400, "BAD_REQUEST", "Status must be draft, review, approved or published.");
    }

    const client = await getPool().connect();
    try {
      await client.query("begin");

      const levelResult = await client.query<{ id: string }>(
        "select id from hsk_levels where level_no = $1 order by sort_order limit 1",
        [level],
      );
      const skillResult = await client.query<{ id: string }>(
        "select id from skills where key = $1 limit 1",
        [skill],
      );

      if (!levelResult.rows[0] || !skillResult.rows[0]) {
        await client.query("rollback");
        return fail(400, "BAD_REQUEST", "HSK levels and skills must be seeded before importing questions.");
      }

      const levelId = levelResult.rows[0].id;
      const skillId = skillResult.rows[0].id;

      const existingSection = await client.query<{ id: string }>(
        `select id from sections
         where level_id = $1 and skill_id = $2 and question_type = $3 and title = $4
         order by sort_order
         limit 1`,
        [levelId, skillId, questionType, sectionTitle],
      );

      let sectionId = existingSection.rows[0]?.id;
      if (!sectionId) {
        const sectionResult = await client.query<{ id: string }>(
          `insert into sections (level_id, skill_id, title, question_type, sort_order, is_premium)
           values ($1, $2, $3, $4,
             coalesce((select max(sort_order) + 1 from sections where level_id = $1 and skill_id = $2), 1),
             false)
           returning id`,
          [levelId, skillId, sectionTitle, questionType],
        );
        sectionId = sectionResult.rows[0].id;
      }

      const questionResult = await client.query<{ id: string }>(
        `insert into questions
          (section_id, external_id, source_type, difficulty, prompt, answer_key, explanation, rubric, status)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9)
         returning id`,
        [
          sectionId,
          externalId,
          sourceType,
          difficulty,
          prompt,
          JSON.stringify({ answer }),
          explanation || null,
          JSON.stringify({ grammar, importedBy: user.id }),
          status,
        ],
      );

      const questionId = questionResult.rows[0].id;

      for (const [index, option] of options.entries()) {
        await client.query(
          `insert into question_options (question_id, label, value, sort_order)
           values ($1, $2, $3, $4)`,
          [questionId, String.fromCharCode(65 + index), option, index + 1],
        );
      }

      await client.query(
        `insert into content_workflow_events
          (actor_id, target_type, target_id, from_status, to_status, note)
         values ($1, 'question', $2, null, $3, $4)`,
        [user.id, questionId, status, "Question imported through admin API."],
      );

      await client.query("commit");

      return ok(
        {
          questionId,
          externalId,
          status,
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("rollback");
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        return fail(409, "CONFLICT", "Question externalId already exists.");
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
