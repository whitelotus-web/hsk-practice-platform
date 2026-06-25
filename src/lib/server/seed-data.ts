import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

export type SeedQuestion = {
  id: string;
  level: number;
  skill: string;
  prompt: string;
  options?: string[];
  answer?: string;
  analysis?: string;
  grammar?: string;
  transcript?: string;
  status?: string;
};

export type SeedData = {
  brand: {
    appName: string;
  };
  levels: Array<{
    id: number;
    name?: string;
    framework?: string;
    targetWords?: number;
    readiness?: number;
  }>;
  advancedExam: {
    name: string;
    levels: number[];
    questions: number;
    duration: number;
    skills: string[];
  };
  practiceQuestions: SeedQuestion[];
  mockQuestions: SeedQuestion[];
  mockSets: Array<{
    id: string;
    level: number;
    band?: string;
    group: string;
    name: string;
    status: string;
    questions: number;
    duration: number;
  }>;
  vocab: Array<{
    hanzi: string;
    pinyin: string;
    meaning: string;
    level: number;
    example?: string;
  }>;
};

let cache: SeedData | undefined;

export function loadSeedData() {
  if (cache) return cache;

  const dataFile = path.join(process.cwd(), "static-app", "data.js");
  const sandbox = { window: {} as { HSK_DATA?: SeedData } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(dataFile, "utf8"), sandbox, { filename: dataFile });

  if (!sandbox.window.HSK_DATA) {
    throw new Error("static-app/data.js did not export window.HSK_DATA.");
  }

  cache = sandbox.window.HSK_DATA;
  return cache;
}
