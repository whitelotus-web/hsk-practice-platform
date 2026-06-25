import { hasDatabase } from "@/lib/server/config";
import { query } from "@/lib/server/db";
import { handleRouteError, ok } from "@/lib/server/http";
import { loadSeedData } from "@/lib/server/seed-data";

export const runtime = "nodejs";

function searchParams(request: Request) {
  const url = new URL(request.url);
  return {
    level: Number(url.searchParams.get("level")) || null,
    skill: url.searchParams.get("skill"),
    status: url.searchParams.get("status") || "published",
    limit: Math.min(Number(url.searchParams.get("limit")) || 50, 200),
  };
}

export async function GET(request: Request) {
  try {
    const { level, skill, status, limit } = searchParams(request);

    if (!hasDatabase()) {
      const seed = loadSeedData();
      const questions = seed.practiceQuestions
        .filter((question) => (level ? question.level === level : true))
        .filter((question) => (skill ? question.skill === skill : true))
        .slice(0, limit);

      return ok({
        source: "seed",
        questions,
      });
    }

    const params: Array<number | string> = [limit];
    const where = ["q.status = $2"];
    params.push(status);

    if (level) {
      params.push(level);
      where.push(`l.level_no = $${params.length}`);
    }

    if (skill) {
      params.push(skill);
      where.push(`sk.key = $${params.length}`);
    }

    const result = await query(
      `select q.id, l.level_no as level, sk.key as skill, s.title as section,
              s.question_type, q.difficulty, q.prompt, q.answer_key,
              q.explanation, q.rubric, q.status, q.created_at, q.updated_at
       from questions q
       join sections s on s.id = q.section_id
       join hsk_levels l on l.id = s.level_id
       join skills sk on sk.id = s.skill_id
       where ${where.join(" and ")}
       order by l.level_no, sk.sort_order, s.sort_order, q.created_at desc
       limit $1`,
      params,
    );

    return ok({
      source: "database",
      questions: result.rows,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
