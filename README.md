# HSK Practice Platform

Prototype for a multi-language HSK learning platform inspired by the product
model of SuperTest/HSKOnline, but designed for original content, better
accessibility, adaptive learning, AI feedback, and a stronger Vietnamese-first
experience.

## Current Status

- `static-app/`: runnable prototype with no package dependency.
- `src/`: Next.js implementation scaffold for the long-term app.
- `docs/supertest-audit.md`: observed product model and upgrade notes.
- `docs/implementation-plan.md`: phased implementation plan.

## Language Direction

- Current learner/admin UI is standardized to Vietnamese first.
- Other locales are kept as translation backlog/admin data, not exposed in the
  learner header yet.
- Machine/AI translation can be used for drafts later, but published learning
  explanations should be reviewed by a human/HSK teacher.

The npm/pnpm install step is currently very slow in this Windows workspace
because registry downloads hang on transitive packages. To keep implementation
moving, the working prototype is available as a static app and the Next.js source
is kept ready for migration once dependencies finish cleanly.

## Run The Working Prototype

From this folder:

```powershell
node scripts/serve-static.mjs static-app 4173
```

Open:

```text
http://localhost:4173
```

## Implemented In Prototype

- Vietnamese-first UI; other locales remain translation backlog/admin data.
- HSK 1-9 level model, including the Advanced HSK 7-9 band.
- Skill tabs: listening, reading, writing, translation, speaking, mock tests.
- Learner dashboard.
- Practice map with gated sections.
- Original starter HSK content for HSK 1-9, including listening/reading/writing,
  HSK 7-9 translation/speaking items, answer keys, Vietnamese explanations,
  grammar notes and transcripts.
- Interactive question renderer with answer analysis, note saving, saved items and
  wrong-question collection.
- Mock test console with timer, answer sheet, submit and answer-key scoring.
- Mock test catalog with Real Mock exam, Mocks, VIP locking and content-source
  boundary notes.
- Advanced HSK 7-9 mock catalog with the 98-question/210-minute exam model and
  seed original questions for the first import cycle.
- Writing workspace with character count and rubric feedback logic.
- Translation/speaking workspace with drafts, rubric feedback, and local browser
  audio recording for speaking practice.
- Vocabulary SRS cards with local mastery grading.
- My exercise repository: wrong questions, saved items, notes, essays, due
  reviews.
- About Test, Test Plan and Test Regulation modules.
- Download App page with original app feature model and store-link TODOs.
- Auth screens: login, register, password reset and QR-auth placeholder.
- Account center: profile, messages, member card, coupons, feedback, password
  and delete-account panels.
- One-on-one tutoring, essay correction operation and corporate/B2B modules.
- Pricing/entitlement model: Free, VIP, MAX, Organization.
- Content admin: import/export JSON for original/licensed questions and vocab.
- Content admin HSK 7-9 operations: coverage dashboard, review queue,
  98-question import template, mock set/mock question import, and content
  validation warnings.
- Local content approval workflow: `draft -> review -> approved -> published`,
  with status export/import for later backend migration.
- System implementation map and super-admin operating roles.
- Local persistence with `localStorage`.

## Next Implementation Steps

1. Finish dependency install or switch package manager once registry is stable.
2. Move `static-app` interactions into the Next.js app shell in `src/`.
3. Add auth/profile and persist data to PostgreSQL.
4. Build original/licensed question-bank CMS.
5. Implement scoring, adaptive review, and AI feedback APIs.

## Source Boundary

Do not copy SuperTest assets, brand, UI artwork, paid question banks, real exam
content, or proprietary data. This project copies the product model and improves
the learning system with original or licensed content.

For HSK 7-9, the app now implements the Advanced exam model as a product
structure: one combined 7/8/9 exam, 98 questions, 210 minutes, and the five
skills Nghe/Đọc/Viết/Dịch/Nói. The included items are original seed content so
the flows run now. Before production, import a full original/licensed 98-question
set per mock and have teachers verify the rubric, audio, translations, and
speaking prompts.

See [docs/legal-content-todo.md](docs/legal-content-todo.md) for the exact list
of brand, legal, content and asset inputs still required.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
