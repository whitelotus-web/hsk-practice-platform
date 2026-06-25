import { hasDatabase } from "@/lib/server/config";
import { query } from "@/lib/server/db";
import { handleRouteError, ok } from "@/lib/server/http";
import { loadSeedData } from "@/lib/server/seed-data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const seed = loadSeedData();

    if (!hasDatabase()) {
      return ok({
        source: "seed",
        levels: seed.levels,
        advancedExam: seed.advancedExam,
      });
    }

    const result = await query<{
      id: string;
      level_no: number;
      framework: string;
      band: string;
      target_words: number;
      section_count: string;
      question_count: string;
    }>(
      `select l.id, l.level_no, l.framework, l.band, l.target_words,
              count(distinct s.id) as section_count,
              count(q.id) as question_count
       from hsk_levels l
       left join sections s on s.level_id = l.id
       left join questions q on q.section_id = s.id
       group by l.id
       order by l.sort_order, l.level_no`,
    );

    return ok({
      source: "database",
      levels: result.rows.map((level) => ({
        id: level.id,
        level: level.level_no,
        framework: level.framework,
        band: level.band,
        targetWords: level.target_words,
        sectionCount: Number(level.section_count),
        questionCount: Number(level.question_count),
      })),
      advancedExam: seed.advancedExam,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
