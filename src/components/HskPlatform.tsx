"use client";

import { useMemo, useState } from "react";
import {
  levels,
  locales,
  modules,
  roadmap,
  sampleQuestion,
  type Section,
  skills,
  type SkillKey,
} from "@/lib/product-model";

type ViewKey = "dashboard" | "practice" | "test" | "writing" | "repository" | "system";

const viewLabels: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  practice: "Practice",
  test: "Mock test",
  writing: "Writing",
  repository: "My exercise",
  system: "System plan",
};

const repositories = [
  { label: "Wrong questions", count: 18, filter: "Skill, source, section, wrong count" },
  { label: "Problem collection", count: 11, filter: "Saved items, exam set, difficulty" },
  { label: "My note", count: 7, filter: "Grammar point, vocabulary, custom tag" },
  { label: "Essay tutoring", count: 3, filter: "Draft, AI feedback, teacher feedback" },
  { label: "Due reviews", count: 24, filter: "SRS due date, confidence, mastery" },
];

export default function HskPlatform() {
  const [locale, setLocale] = useState("vi");
  const [activeLevelId, setActiveLevelId] = useState(1);
  const [activeSkill, setActiveSkill] = useState<SkillKey>("listening");
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [essay, setEssay] = useState("");

  const activeLevel = useMemo(
    () => levels.find((level) => level.id === activeLevelId) ?? levels[0],
    [activeLevelId],
  );

  const activeSections = activeLevel.sections[activeSkill] ?? [];
  const localeName = locales.find((item) => item.code === locale)?.name ?? "Tiếng Việt";
  const answeredTotal = activeSections.reduce((sum, section) => sum + section.answered, 0);
  const correctTotal = activeSections.reduce((sum, section) => sum + section.correct, 0);
  const accuracy = answeredTotal ? Math.round((correctTotal / answeredTotal) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f7fbf9] text-zinc-950">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              HSK Practice Platform
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Intelligent HSK learning workspace
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-zinc-600" htmlFor="locale">
              Interface
            </label>
            <select
              id="locale"
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
              className="h-10 rounded-md border border-emerald-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
            >
              {locales.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              Active: {localeName}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[260px_1fr] md:px-6">
        <aside className="space-y-4">
          <section className="rounded-lg border border-emerald-100 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Learner target
            </h2>
            <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-2xl font-semibold">HSK {activeLevel.id}</p>
              <p className="mt-1 text-sm text-emerald-900">{activeLevel.name}</p>
              <p className="mt-1 text-xs text-zinc-600">{activeLevel.targetWords} target words</p>
            </div>
            <label className="mt-3 block text-sm font-medium text-zinc-700" htmlFor="level-select">
              Choose level
            </label>
            <select
              id="level-select"
              value={activeLevelId}
              onChange={(event) => setActiveLevelId(Number(event.target.value))}
              className="mt-2 h-11 w-full rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  HSK {level.id} - {level.targetWords} words{level.id >= 7 ? " (Advanced)" : ""}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-lg border border-emerald-100 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Skills
            </h2>
            <div className="mt-3 space-y-2">
              {skills.map((skill) => {
                const disabled = activeLevel.sections[skill.key].length === 0;
                return (
                  <button
                    key={skill.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setActiveSkill(skill.key);
                      setActiveView(skill.key === "tests" ? "test" : skill.key === "writing" ? "writing" : "practice");
                    }}
                    className={`w-full rounded-md border px-3 py-3 text-left transition ${
                      activeSkill === skill.key
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-zinc-200 bg-white hover:border-emerald-300"
                    } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span className="block font-medium">{skill.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">{skill.description}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <nav className="flex flex-wrap gap-2 rounded-lg border border-emerald-100 bg-white p-2">
            {(Object.keys(viewLabels) as ViewKey[]).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeView === view
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {viewLabels[view]}
              </button>
            ))}
          </nav>

          {activeView === "dashboard" && (
            <Dashboard
              activeLevelName={activeLevel.name}
              readiness={activeLevel.readiness}
              accuracy={accuracy}
              answeredTotal={answeredTotal}
            />
          )}

          {activeView === "practice" && (
            <Practice
              activeLevelName={activeLevel.name}
              activeSkill={activeSkill}
              sections={activeSections}
              selectedAnswer={selectedAnswer}
              showAnalysis={showAnalysis}
              setSelectedAnswer={setSelectedAnswer}
              setShowAnalysis={setShowAnalysis}
            />
          )}

          {activeView === "test" && <MockTest activeLevelName={activeLevel.name} />}

          {activeView === "writing" && (
            <Writing activeLevelName={activeLevel.name} essay={essay} setEssay={setEssay} />
          )}

          {activeView === "repository" && <Repository />}

          {activeView === "system" && <SystemPlan />}
        </section>
      </div>
    </main>
  );
}

function Dashboard({
  activeLevelName,
  readiness,
  accuracy,
  answeredTotal,
}: {
  activeLevelName: string;
  readiness: number;
  accuracy: number;
  answeredTotal: number;
}) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Target", activeLevelName, "Current preparation level"],
          ["Readiness", `${readiness}%`, "Estimated from attempts"],
          ["Accuracy", `${accuracy}%`, `${answeredTotal} answers logged`],
          ["Streak", "0 days", "Connect after auth"],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-lg border border-emerald-100 bg-white p-4">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className="mt-2 text-sm text-zinc-500">{hint}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-emerald-100 bg-white p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Today&apos;s study plan</h2>
            <p className="mt-1 text-sm text-zinc-600">
              This keeps the SuperTest model, then upgrades it with adaptive review and a complete learner loop.
            </p>
          </div>
          <button className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">
            Start smart quiz
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {modules.map((module) => (
            <article key={module.id} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{module.title}</h3>
                <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800">
                  {module.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{module.subtitle}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{module.metric}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Practice({
  activeLevelName,
  activeSkill,
  sections,
  selectedAnswer,
  showAnalysis,
  setSelectedAnswer,
  setShowAnalysis,
}: {
  activeLevelName: string;
  activeSkill: SkillKey;
  sections: Section[];
  selectedAnswer: string | null;
  showAnalysis: boolean;
  setSelectedAnswer: (value: string | null) => void;
  setShowAnalysis: (value: boolean) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-emerald-100 bg-white p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">{activeLevelName}</p>
            <h2 className="text-xl font-semibold capitalize">{activeSkill} practice map</h2>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">
              Single training
            </button>
            <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Smart quiz
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {sections.length === 0 ? (
            <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
              This level does not include the selected skill in the current HSK 1-6 web model.
            </p>
          ) : (
            sections.map((section) => (
              <article key={section.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{section.title}</h3>
                      {section.gated && (
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                          VIP gated
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{section.type}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-600">
                    {section.correct}/{section.answered} correct
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${section.progress}%` }} />
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-emerald-100 bg-white p-5">
        <p className="text-sm font-medium text-emerald-700">Sample renderer</p>
        <h2 className="mt-1 text-lg font-semibold">{sampleQuestion.type}</h2>
        <div className="mt-4 rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Audio</p>
            <button className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">
              Play
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">{sampleQuestion.prompt}</p>
        </div>
        <div className="mt-4 space-y-2">
          {sampleQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelectedAnswer(option);
                setShowAnalysis(true);
              }}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm font-medium ${
                selectedAnswer === option
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                  : "border-zinc-200 hover:border-emerald-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-800"
          >
            Check answer analysis
          </button>
          <button className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700">
            Add note
          </button>
        </div>
        {showAnalysis && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <p className="font-semibold">Correct answer: {sampleQuestion.answer}</p>
            <p className="mt-2">{sampleQuestion.explanation}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MockTest({ activeLevelName }: { activeLevelName: string }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="rounded-lg border border-emerald-100 bg-white p-5">
        <p className="text-sm font-medium text-emerald-700">{activeLevelName}</p>
        <h2 className="mt-1 text-xl font-semibold">Mock exam console</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["Real-style mock set 1", "Real-style mock set 2", "Past exam pack", "Adaptive mini mock"].map(
            (test, index) => (
              <article key={test} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{test}</h3>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">
                    {index === 0 ? "Open" : "VIP"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Timed sections, autosave, unanswered review, score report, and generated drills after submit.
                </p>
                <button className="mt-4 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                  Start test
                </button>
              </article>
            ),
          )}
        </div>
      </div>
      <aside className="rounded-lg border border-emerald-100 bg-white p-5">
        <h3 className="font-semibold">Exam state machine</h3>
        <ol className="mt-4 space-y-3 text-sm text-zinc-700">
          {["Not started", "In progress", "Autosaved", "Submitted", "Scored", "Review", "Drill generated"].map(
            (state) => (
              <li key={state} className="rounded-md border border-zinc-200 px-3 py-2">
                {state}
              </li>
            ),
          )}
        </ol>
      </aside>
    </section>
  );
}

function Writing({
  activeLevelName,
  essay,
  setEssay,
}: {
  activeLevelName: string;
  essay: string;
  setEssay: (value: string) => void;
}) {
  const characterCount = Array.from(essay.trim()).filter(Boolean).length;

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-emerald-100 bg-white p-5">
        <p className="text-sm font-medium text-emerald-700">{activeLevelName}</p>
        <h2 className="mt-1 text-xl font-semibold">Writing workspace</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Read original", "Abbreviate article", "Show full text", "Reference answer"].map((action) => (
            <button
              key={action}
              className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
            >
              {action}
            </button>
          ))}
        </div>
        <label className="mt-5 block text-sm font-medium text-zinc-700" htmlFor="essay-title">
          Title
        </label>
        <input
          id="essay-title"
          className="mt-2 h-11 w-full rounded-md border border-zinc-200 px-3 outline-none focus:border-emerald-500"
          placeholder="Enter essay title"
        />
        <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="essay-content">
          Content
        </label>
        <textarea
          id="essay-content"
          value={essay}
          onChange={(event) => setEssay(event.target.value)}
          rows={10}
          className="mt-2 w-full rounded-md border border-zinc-200 p-3 leading-7 outline-none focus:border-emerald-500"
          placeholder="Write your Chinese answer here..."
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">{characterCount} characters</p>
          <div className="flex gap-2">
            <button className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium">Save draft</button>
            <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
              Get AI feedback
            </button>
          </div>
        </div>
      </div>
      <aside className="rounded-lg border border-emerald-100 bg-white p-5">
        <h3 className="font-semibold">Feedback rubric</h3>
        <div className="mt-4 space-y-3">
          {["Task completion", "Grammar", "Vocabulary", "Cohesion", "Character accuracy", "Exam timing"].map(
            (item) => (
              <div key={item} className="rounded-md border border-zinc-200 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{item}</span>
                  <span className="font-semibold text-emerald-700">Pending</span>
                </div>
              </div>
            ),
          )}
        </div>
      </aside>
    </section>
  );
}

function Repository() {
  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">My exercise repository</h2>
          <p className="mt-1 text-sm text-zinc-600">
            SuperTest stores wrong questions, notes, essays, and collected problems. This design adds SRS and AI drills.
          </p>
        </div>
        <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
          Generate review set
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {repositories.map((repo) => (
          <article key={repo.label} className="rounded-lg border border-zinc-200 p-4">
            <p className="text-2xl font-semibold">{repo.count}</p>
            <h3 className="mt-2 font-semibold">{repo.label}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{repo.filter}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SystemPlan() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-emerald-100 bg-white p-5">
        <h2 className="text-xl font-semibold">Implementation roadmap</h2>
        <div className="mt-5 space-y-3">
          {roadmap.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-lg border border-zinc-200 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-zinc-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <aside className="rounded-lg border border-emerald-100 bg-white p-5">
        <h3 className="font-semibold">Architecture modules</h3>
        <ul className="mt-4 space-y-2 text-sm text-zinc-700">
          {[
            "Auth and profile",
            "Locale and content translations",
            "Question bank CMS",
            "Attempt and scoring engine",
            "Subscription entitlements",
            "AI feedback services",
            "Organization dashboard",
          ].map((item) => (
            <li key={item} className="rounded-md bg-zinc-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
