export type Locale = {
  code: string;
  name: string;
  learnerLabel: string;
};

export type SkillKey = "listening" | "reading" | "writing" | "tests";

export type Section = {
  id: string;
  title: string;
  type: string;
  progress: number;
  correct: number;
  answered: number;
  gated?: boolean;
};

export type Level = {
  id: number;
  name: string;
  framework: "HSK 2.0" | "HSK 3.0";
  targetWords: number;
  readiness: number;
  sections: Record<SkillKey, Section[]>;
};

export type Module = {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  status: string;
};

export const locales: Locale[] = [
  { code: "en", name: "English", learnerLabel: "English UI" },
  { code: "zh", name: "简体中文", learnerLabel: "Chinese UI" },
  { code: "ja", name: "日本語", learnerLabel: "Japanese UI" },
  { code: "ko", name: "한국어", learnerLabel: "Korean UI" },
  { code: "vi", name: "Tiếng Việt", learnerLabel: "Vietnamese UI" },
  { code: "th", name: "ภาษาไทย", learnerLabel: "Thai UI" },
  { code: "ru", name: "Русский", learnerLabel: "Russian UI" },
  { code: "es", name: "español", learnerLabel: "Spanish UI" },
  { code: "fr", name: "Français", learnerLabel: "French UI" },
  { code: "id", name: "Bahasa Indonesia", learnerLabel: "Indonesian UI" },
  { code: "de", name: "German", learnerLabel: "German UI" },
  { code: "pt", name: "Português", learnerLabel: "Portuguese UI" },
  { code: "it", name: "Italian", learnerLabel: "Italian UI" },
];

export const skills: { key: SkillKey; label: string; description: string }[] = [
  {
    key: "listening",
    label: "Listening",
    description: "Audio questions, picture matching, dialogue drills.",
  },
  {
    key: "reading",
    label: "Reading",
    description: "Sentence matching, gap fill, order, and comprehension.",
  },
  {
    key: "writing",
    label: "Writing",
    description: "Sentence ordering, essay editor, AI/teacher feedback.",
  },
  {
    key: "tests",
    label: "Mock tests",
    description: "Timed exam attempts, score reports, review mode.",
  },
];

const emptySections: Section[] = [];

export const levels: Level[] = [
  {
    id: 1,
    name: "HSK Level 1",
    framework: "HSK 2.0",
    targetWords: 150,
    readiness: 32,
    sections: {
      listening: [
        { id: "1-l-1", title: "Section 1", type: "True or false", progress: 18, correct: 9, answered: 12 },
        { id: "1-l-2", title: "Section 2", type: "Match sentences with pictures", progress: 4, correct: 2, answered: 4, gated: true },
        { id: "1-l-3", title: "Section 3", type: "Match dialogues with pictures", progress: 0, correct: 0, answered: 0, gated: true },
        { id: "1-l-4", title: "Section 4", type: "Choose the right answer", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "1-r-1", title: "Section 1", type: "True or false", progress: 22, correct: 12, answered: 14 },
        { id: "1-r-2", title: "Section 2", type: "Choose the right pictures", progress: 8, correct: 4, answered: 7 },
        { id: "1-r-3", title: "Section 3", type: "Choose the right sentences", progress: 0, correct: 0, answered: 0, gated: true },
        { id: "1-r-4", title: "Section 4", type: "Fill in the gap", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      writing: emptySections,
      tests: [
        { id: "1-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "1-t-2", title: "Mock exam set 2", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
  {
    id: 2,
    name: "HSK Level 2",
    framework: "HSK 2.0",
    targetWords: 300,
    readiness: 21,
    sections: {
      listening: [
        { id: "2-l-1", title: "Section 1", type: "True or false", progress: 9, correct: 5, answered: 8 },
        { id: "2-l-2", title: "Section 2", type: "Match dialogues with pictures", progress: 0, correct: 0, answered: 0 },
        { id: "2-l-3", title: "Section 3", type: "Dialogue questions", progress: 0, correct: 0, answered: 0, gated: true },
        { id: "2-l-4", title: "Section 4", type: "Dialogue questions", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "2-r-1", title: "Section 1", type: "Choose the right pictures", progress: 6, correct: 3, answered: 5 },
        { id: "2-r-2", title: "Section 2", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "2-r-3", title: "Section 3", type: "True or false", progress: 0, correct: 0, answered: 0 },
        { id: "2-r-4", title: "Section 4", type: "Choose the right sentences", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      writing: emptySections,
      tests: [
        { id: "2-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "2-t-2", title: "Mock exam set 2", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
  {
    id: 3,
    name: "HSK Level 3",
    framework: "HSK 2.0",
    targetWords: 600,
    readiness: 14,
    sections: {
      listening: [
        { id: "3-l-1", title: "Section 1", type: "Choose the right pictures", progress: 0, correct: 0, answered: 0 },
        { id: "3-l-2", title: "Section 2", type: "True or false", progress: 0, correct: 0, answered: 0 },
        { id: "3-l-3", title: "Section 3", type: "Dialogue questions", progress: 0, correct: 0, answered: 0, gated: true },
        { id: "3-l-4", title: "Section 4", type: "Dialogue questions", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "3-r-1", title: "Section 1", type: "Choose the right sentences", progress: 0, correct: 0, answered: 0 },
        { id: "3-r-2", title: "Section 2", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "3-r-3", title: "Section 3", type: "Reading comprehension", progress: 0, correct: 0, answered: 0 },
      ],
      writing: [
        { id: "3-w-1", title: "Section 1", type: "Arrange sentence order", progress: 0, correct: 0, answered: 0 },
        { id: "3-w-2", title: "Section 2", type: "Write characters", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      tests: [
        { id: "3-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "3-t-2", title: "Past exam set", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
  {
    id: 4,
    name: "HSK Level 4",
    framework: "HSK 2.0",
    targetWords: 1200,
    readiness: 9,
    sections: {
      listening: [
        { id: "4-l-1", title: "Section 1", type: "True or false", progress: 0, correct: 0, answered: 0 },
        { id: "4-l-2", title: "Section 2", type: "Dialogue questions", progress: 0, correct: 0, answered: 0 },
        { id: "4-l-3", title: "Section 3", type: "Dialogue questions", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "4-r-1", title: "Section 1", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "4-r-2", title: "Section 2", type: "Arrange sentence order", progress: 0, correct: 0, answered: 0 },
        { id: "4-r-3", title: "Section 3", type: "Choose the right answer", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      writing: [
        { id: "4-w-1", title: "Section 1", type: "Arrange sentence order", progress: 0, correct: 0, answered: 0 },
        { id: "4-w-2", title: "Section 2", type: "Picture sentence writing", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      tests: [
        { id: "4-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "4-t-2", title: "Past exam set", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
  {
    id: 5,
    name: "HSK Level 5",
    framework: "HSK 2.0",
    targetWords: 2500,
    readiness: 6,
    sections: {
      listening: [
        { id: "5-l-1", title: "Section 1", type: "Dialogue questions", progress: 0, correct: 0, answered: 0 },
        { id: "5-l-2", title: "Section 2", type: "Passage questions", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "5-r-1", title: "Section 1", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "5-r-2", title: "Section 2", type: "Choose the right sentence", progress: 0, correct: 0, answered: 0 },
        { id: "5-r-3", title: "Section 3", type: "Reading comprehension", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      writing: [
        { id: "5-w-1", title: "Section 1", type: "Arrange sentence order", progress: 0, correct: 0, answered: 0 },
        { id: "5-w-2", title: "Section 2", type: "Keyword essay", progress: 0, correct: 0, answered: 0 },
        { id: "5-w-3", title: "Section 3", type: "Picture essay", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      tests: [
        { id: "5-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "5-t-2", title: "Past exam set", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
  {
    id: 6,
    name: "HSK Level 6",
    framework: "HSK 2.0",
    targetWords: 5000,
    readiness: 4,
    sections: {
      listening: [
        { id: "6-l-1", title: "Section 1", type: "Choose the consistent sentence", progress: 0, correct: 0, answered: 0 },
        { id: "6-l-2", title: "Section 2", type: "Interview questions", progress: 0, correct: 0, answered: 0 },
        { id: "6-l-3", title: "Section 3", type: "Passage questions", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      reading: [
        { id: "6-r-1", title: "Section 1", type: "Find the incorrect sentence", progress: 0, correct: 0, answered: 0 },
        { id: "6-r-2", title: "Section 2", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "6-r-3", title: "Section 3", type: "Fill in the gap", progress: 0, correct: 0, answered: 0 },
        { id: "6-r-4", title: "Section 4", type: "Reading comprehension", progress: 0, correct: 0, answered: 0, gated: true },
      ],
      writing: [
        { id: "6-w-1", title: "Section 1", type: "Abbreviated article essay", progress: 0, correct: 0, answered: 0 },
      ],
      tests: [
        { id: "6-t-1", title: "Mock exam set 1", type: "Timed test", progress: 0, correct: 0, answered: 0 },
        { id: "6-t-2", title: "Past exam set", type: "Timed test", progress: 0, correct: 0, answered: 0, gated: true },
      ],
    },
  },
];

export const modules: Module[] = [
  {
    id: "diagnostic",
    title: "AI diagnostic",
    subtitle: "Estimate level, weak skills, target score, and exam date plan.",
    metric: "12 min",
    status: "MVP planned",
  },
  {
    id: "smart-quiz",
    title: "Smart quiz",
    subtitle: "Adaptive mixed drill using wrong answers and low confidence items.",
    metric: "5-20 questions",
    status: "Core loop",
  },
  {
    id: "mock-test",
    title: "Mock test",
    subtitle: "Timed HSK simulation with autosave, review, score report.",
    metric: "HSK 1-6",
    status: "Exam mode",
  },
  {
    id: "vocab",
    title: "Vocabulary SRS",
    subtitle: "Daily cards, example sentences, pinyin, audio, and mastery state.",
    metric: "150-5000 words",
    status: "Next",
  },
  {
    id: "writing",
    title: "Writing correction",
    subtitle: "Essay editor, rubric, AI feedback, teacher correction credits.",
    metric: "HSK 3-6",
    status: "Premium",
  },
  {
    id: "repository",
    title: "My exercise",
    subtitle: "Wrong questions, saved problems, notes, essays, due reviews.",
    metric: "Personal",
    status: "Retention",
  },
];

export const sampleQuestion = {
  type: "Listening / True or false",
  prompt: "Listen to the audio and decide whether the statement is correct.",
  options: ["True", "False"],
  answer: "True",
  explanation:
    "The explanation panel should show transcript, translation, grammar point, and why each option is right or wrong.",
};

export const roadmap = [
  "Ship web learning dashboard and practice renderer.",
  "Add auth, profile, goals, and subscription entitlement service.",
  "Build CMS for original/licensed question bank and translations.",
  "Implement attempts, scoring, reports, and adaptive mistake review.",
  "Add AI writing/speaking correction and diagnostic planning.",
  "Expand to mobile apps, offline packs, and B2B dashboards.",
];
