import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import pg from "pg";
import { requireDatabaseUrl, sslForDatabaseUrl } from "./db-env.mjs";

const { Pool } = pg;

const skillOrder = {
  listening: 1,
  reading: 2,
  writing: 3,
  translation: 4,
  speaking: 5,
};

function loadSeedData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(process.cwd(), "static-app", "data.js"), "utf8"),
    sandbox,
    { filename: "static-app/data.js" },
  );
  return sandbox.window.HSK_DATA;
}

async function upsertCoreData(client, data) {
  for (const [code, name] of data.locales.slice(0, 3)) {
    await client.query(
      `insert into locales (code, name, enabled)
       values ($1, $2, true)
       on conflict (code) do update set name = excluded.name, enabled = true`,
      [code, name],
    );
  }

  for (const [key, sortOrder] of Object.entries(skillOrder)) {
    await client.query(
      `insert into skills (key, sort_order)
       values ($1, $2)
       on conflict (key) do update set sort_order = excluded.sort_order`,
      [key, sortOrder],
    );
  }

  for (const level of data.levels) {
    const framework = level.id >= 7 ? "HSK 3.0" : "HSK 2.0";
    const band = level.id >= 7 ? "advanced" : "standard";
    await client.query(
      `insert into hsk_levels (level_no, framework, band, target_words, sort_order)
       values ($1, $2, $3, $4, $5)
       on conflict (framework, level_no) do update set
        band = excluded.band,
        target_words = excluded.target_words,
        sort_order = excluded.sort_order`,
      [level.id, framework, band, level.targetWords ?? level.target_words ?? 0, level.id],
    );
  }
}

async function getLevelId(client, levelNo) {
  const result = await client.query(
    "select id from hsk_levels where level_no = $1 order by sort_order limit 1",
    [levelNo],
  );
  if (!result.rows[0]) throw new Error(`Missing hsk_levels row for HSK ${levelNo}.`);
  return result.rows[0].id;
}

async function getSkillId(client, key) {
  const result = await client.query("select id from skills where key = $1 limit 1", [key]);
  if (!result.rows[0]) throw new Error(`Missing skills row for ${key}.`);
  return result.rows[0].id;
}

async function getSectionId(client, question) {
  const levelId = await getLevelId(client, question.level);
  const skillId = await getSkillId(client, question.skill);
  const title = question.section || `HSK ${question.level} ${question.skill}`;
  const questionType = question.type || "seed";

  const existing = await client.query(
    `select id from sections
     where level_id = $1 and skill_id = $2 and title = $3 and question_type = $4
     limit 1`,
    [levelId, skillId, title, questionType],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await client.query(
    `insert into sections (level_id, skill_id, title, question_type, sort_order, is_premium)
     values ($1, $2, $3, $4,
       coalesce((select max(sort_order) + 1 from sections where level_id = $1 and skill_id = $2), 1),
       false)
     returning id`,
    [levelId, skillId, title, questionType],
  );
  return inserted.rows[0].id;
}

async function upsertQuestion(client, question, sourceName) {
  const sectionId = await getSectionId(client, question);
  const answerKey = {
    answer: question.answer ?? null,
    options: question.options ?? [],
  };
  const rubric = {
    grammar: question.grammar ?? null,
    translation: question.translation ?? null,
    transcript: question.transcript ?? null,
    assetStatus: question.assetStatus ?? null,
    sourceName,
  };

  const result = await client.query(
    `insert into questions
      (section_id, external_id, source_type, difficulty, prompt, answer_key, explanation, rubric, status)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, 'published')
     on conflict (external_id) do update set
      section_id = excluded.section_id,
      source_type = excluded.source_type,
      difficulty = excluded.difficulty,
      prompt = excluded.prompt,
      answer_key = excluded.answer_key,
      explanation = excluded.explanation,
      rubric = excluded.rubric,
      status = excluded.status,
      updated_at = now()
     returning id`,
    [
      sectionId,
      question.id,
      question.source || sourceName,
      question.difficulty || question.level || 1,
      question.prompt,
      JSON.stringify(answerKey),
      question.analysis || null,
      JSON.stringify(rubric),
    ],
  );

  const questionId = result.rows[0].id;
  await client.query("delete from question_options where question_id = $1", [questionId]);
  for (const [index, option] of (question.options ?? []).entries()) {
    await client.query(
      `insert into question_options (question_id, label, value, sort_order)
       values ($1, $2, $3, $4)`,
      [questionId, String.fromCharCode(65 + index), option, index + 1],
    );
  }
}

async function upsertVocab(client, item) {
  const levelId = await getLevelId(client, item.level);
  await client.query(
    `insert into vocab_items (level_id, hanzi, pinyin, meaning, examples)
     values ($1, $2, $3, $4::jsonb, $5::jsonb)
     on conflict (level_id, hanzi, pinyin) do update set
      meaning = excluded.meaning,
      examples = excluded.examples`,
    [
      levelId,
      item.hanzi,
      item.pinyin,
      JSON.stringify({ vi: item.meaning }),
      JSON.stringify(item.example ? [{ zh: item.example }] : []),
    ],
  );
}

const databaseUrl = requireDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslForDatabaseUrl(databaseUrl),
});

try {
  const data = loadSeedData();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await upsertCoreData(client, data);

    for (const question of data.practiceQuestions) {
      await upsertQuestion(client, question, "practice-seed");
    }

    for (const question of data.mockQuestions) {
      await upsertQuestion(
        client,
        {
          section: "Mock seed",
          type: "Mock question",
          difficulty: question.level,
          source: "mock-seed",
          ...question,
        },
        "mock-seed",
      );
    }

    for (const item of data.vocab) {
      await upsertVocab(client, item);
    }

    await client.query("commit");

    const counts = await client.query(`
      select
        (select count(*) from hsk_levels) as levels,
        (select count(*) from questions) as questions,
        (select count(*) from vocab_items) as vocab_items
    `);
    console.log(`Seed complete: ${JSON.stringify(counts.rows[0])}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
