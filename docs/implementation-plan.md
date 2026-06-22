# HSK Practice Platform Implementation Plan

## Phase 1: Web MVP

Goal: prove the full learning loop on web.

- Multi-language shell with 13 observed locales.
- Learner dashboard.
- HSK 1-9 model, including the Advanced HSK 7-9 band.
- Listening, reading, writing, HSK 7-9 translation/speaking, mock test,
  vocabulary, and personal repository modules.
- Practice item renderer with audio, image, option, fill-gap, order, and essay
  support.
- Productive-skill renderer for HSK 7-9 translation/speaking drafts, rubric
  feedback, local audio recording, and future teacher review.
- Public website modules: About Test, Test Plan, Test Regulation, Download App,
  Login/Register/Reset, Account Center, Tutoring, Corporate Services.
- Attempt tracking and local sample data.
- Wrong question collection, notes, and saved questions.
- Subscription/entitlement placeholders.
- Admin/content model documentation.
- HSK 7-9 content operations dashboard: coverage, review queue, import
  template, mock set import, and validation warnings.
- Local approval workflow for learning content: draft, review, approved,
  published.

## Phase 2: Backend

- Auth and account management.
- PostgreSQL schema with Prisma or Drizzle.
- Content CMS for question bank and translations.
- Content review workflow for audio, transcript, rubric, teacher approval and
  full 98-question Advanced HSK mocks.
- Persist content workflow status, reviewer, timestamps and audit events in the
  database.
- Attempt APIs and scoring.
- File storage for audio/images.
- Entitlement service.
- Payment provider integration.

## Phase 3: AI Layer

- Diagnostic test.
- Adaptive study plan.
- Answer explanation assistant.
- AI writing correction.
- AI translation and speaking scoring for HSK 7-9.
- Weak-point drill generation.
- Weekly progress summary.

## Advanced HSK 7-9 Direction

- Treat HSK 7/8/9 as one Advanced exam band in the product model.
- Keep learner navigation by target outcome level 7, 8, or 9.
- Full mock metadata: 98 questions, 210 minutes, Nghe/Đọc/Viết/Dịch/Nói.
- Do not fabricate full official papers. Import original/licensed 98-question
  sets through Content Admin, then teacher-review answers, transcript, audio,
  translation rubric, and speaking rubric before publishing.
- Make MAX/teacher workflows stronger than competitors: translation review,
  speaking recording, academic writing, long-reading drills, and adaptive
  weakness reports.

## Phase 4: Mobile Apps

- React Native or Flutter app.
- Offline practice packs.
- Push reminders.
- In-app purchases.
- Audio recording and speaking workflow.

## Phase 5: B2B

- Organization accounts.
- Teacher dashboard.
- Class assignments.
- Seat management.
- Progress reports.
- Enterprise billing.

## Technical Direction

- Frontend: Next.js, TypeScript, Tailwind CSS.
- Backend: Next.js route handlers for MVP, then NestJS or dedicated service if
  scale requires it.
- Database: PostgreSQL.
- Cache/queue: Redis.
- Object storage: S3-compatible storage.
- Search: Meilisearch or OpenSearch.
- AI: provider abstraction for writing/speaking/explanation tasks.

## Current Prototype Scope

This repository starts with a frontend prototype and product system:

- `src/lib/product-model.ts`: product taxonomy and sample content.
- `src/components/HskPlatform.tsx`: interactive learner experience.
- `src/app/page.tsx`: main app entry.
- `docs/supertest-audit.md`: observed model and upgrade opportunities.
- `static-app/app.js`: current working implementation of the audited module map.
