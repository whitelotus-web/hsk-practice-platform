import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const failures = [];
const passes = [];

function filePath(...parts) {
  return path.join(root, ...parts);
}

function readText(...parts) {
  return fs.readFileSync(filePath(...parts), "utf8");
}

function check(condition, message) {
  if (condition) {
    passes.push(message);
  } else {
    failures.push(message);
  }
}

function sameSet(actual, expected) {
  return actual.length === expected.length && expected.every((item) => actual.includes(item));
}

function getData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(readText("static-app", "data.js"), sandbox, { filename: "static-app/data.js" });
  return sandbox.window.HSK_DATA;
}

const indexHtml = readText("static-app", "index.html");
const serviceWorker = readText("static-app", "sw.js");
const appJs = readText("static-app", "app.js");
const stylesCss = readText("static-app", "styles.css");
const manifest = JSON.parse(readText("static-app", "manifest.webmanifest"));
const legalTodo = readText("docs", "legal-content-todo.md");
const data = getData();

check(Boolean(data), "static data exports window.HSK_DATA");

const versionedAssetRefs = ["styles.css", "data.js", "app.js"].map((asset) => {
  const match = indexHtml.match(new RegExp(`\\./${asset}\\?v=([0-9a-z]+)`, "i"));
  check(Boolean(match), `index references versioned ${asset}`);
  return match ? `./${asset}?v=${match[1]}` : null;
}).filter(Boolean);

for (const ref of versionedAssetRefs) {
  check(serviceWorker.includes(ref), `service worker caches ${ref}`);
}

check(/CACHE_VERSION\s*=\s*"hsk-mastery-v\d+"/.test(serviceWorker), "service worker cache version is explicit");
check(fs.existsSync(filePath("static-app", "offline.html")), "offline fallback exists");
check(fs.existsSync(filePath("static-app", "icons", "icon.svg")), "PWA icon exists");
check(appJs.includes("data-level-select"), "level selector uses compact select control");
check(stylesCss.includes(".level-select"), "level selector has dedicated responsive styles");

check(manifest.name === data.brand.appName, "manifest name matches product data");
check(manifest.start_url === "./index.html", "manifest has static start_url");
check(manifest.display === "standalone", "manifest enables standalone PWA mode");
check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "manifest has icons");

const forbiddenBrandPattern = /supertest|hskonline/i;
check(!forbiddenBrandPattern.test(data.brand.appName), "app name does not copy protected competitor marks");
check(!forbiddenBrandPattern.test(data.brand.legalName || ""), "legal name does not copy protected competitor marks");
check(Array.isArray(data.protectedCloneTodo) && data.protectedCloneTodo.length >= 3, "protected clone TODO list is present");
check(/Do Not Copy/i.test(legalTodo) && /paid question bank/i.test(legalTodo), "legal content boundary document is present");

const expectedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const levelIds = data.levels.map((level) => level.id).sort((a, b) => a - b);
check(sameSet(levelIds, expectedLevels), "HSK level model covers levels 1-9");

check(data.sourceLocale === "vi", "Vietnamese is the source locale");
check(data.fallbackLocale === "en", "English is configured as fallback locale");
const localeCodes = data.locales.map(([code]) => code);
for (const locale of ["vi", "en", "zh"]) {
  check(localeCodes.includes(locale), `locale backlog includes ${locale}`);
}

for (const key of ["appTitle", "practice", "mock", "writing", "vocab", "repository", "account", "content"]) {
  check(Boolean(data.dict.vi[key]), `Vietnamese dictionary includes ${key}`);
}

check(data.advancedExam?.name === "HSK 7-9 Advanced", "advanced exam model is named");
check(sameSet(data.advancedExam?.levels || [], [7, 8, 9]), "advanced exam covers HSK 7-9");
check(Number(data.advancedExam?.questions) === 98, "advanced exam has 98 questions");
check(Number(data.advancedExam?.duration) === 210, "advanced exam has 210 minutes");
check(Array.isArray(data.advancedExam?.skills) && data.advancedExam.skills.length >= 5, "advanced exam covers five skills");

check(Array.isArray(data.practiceQuestions) && data.practiceQuestions.length > 0, "practice question bank is present");
const practiceLevels = [...new Set(data.practiceQuestions.map((question) => question.level))].sort((a, b) => a - b);
check(sameSet(practiceLevels, expectedLevels), "practice questions cover HSK 1-9");

const requiredQuestionFields = ["id", "level", "skill", "prompt", "answer", "analysis"];
const malformedQuestion = data.practiceQuestions.find((question) => requiredQuestionFields.some((field) => !question[field]));
check(!malformedQuestion, "practice questions include required fields");

const advancedSkills = [...new Set(
  data.practiceQuestions
    .filter((question) => [7, 8, 9].includes(question.level))
    .map((question) => question.skill),
)].sort();
check(
  sameSet(advancedSkills, ["listening", "reading", "speaking", "translation", "writing"]),
  "HSK 7-9 practice covers listening, reading, writing, translation and speaking",
);

check(Array.isArray(data.mockQuestions) && data.mockQuestions.length > 0, "mock question bank is present");
const mockQuestionIds = new Set(data.mockQuestions.map((question) => question.id));
const mockQuestionsMissingRefs = data.mockSets
  .filter((set) => set.questionIds)
  .flatMap((set) => set.questionIds.filter((id) => !mockQuestionIds.has(id)));
check(mockQuestionsMissingRefs.length === 0, "mock set question references are valid");

const advancedMockSets = data.mockSets.filter((set) => set.band === "advanced" || [7, 8, 9].includes(set.level));
check(advancedMockSets.length >= 3, "advanced mock catalog includes multiple sets");
check(
  advancedMockSets.some((set) => Number(set.questions) === 98 && Number(set.duration) === 210 && set.status === "open"),
  "advanced open mock includes 98 questions and 210 minutes",
);

const vocabLevels = [...new Set(data.vocab.map((item) => item.level))].sort((a, b) => a - b);
check(sameSet(vocabLevels, expectedLevels), "vocabulary SRS covers HSK 1-9");
const malformedVocab = data.vocab.find((item) => !item.hanzi || !item.pinyin || !item.meaning || !item.level);
check(!malformedVocab, "vocabulary items include hanzi, pinyin, meaning and level");

if (failures.length > 0) {
  console.error("Static smoke checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Static smoke checks passed (${passes.length} checks).`);
