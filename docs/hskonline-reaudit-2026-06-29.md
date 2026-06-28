# HSKOnline / SuperTest Re-Audit And Upgrade Plan - 2026-06-29

This note updates the product audit from the public HSKOnline/SuperTest website.
It is a competitive product-model analysis, not a plan to copy protected brand,
UI artwork, paid content, mock papers, audio, images, learner reviews, legal
wording, or proprietary databases.

## Public Sources Checked

- `https://www.hskonline.com/`
- `https://www.hskonline.com/en/1`
- `https://www.hskonline.com/en/2`
- `https://www.hskonline.com/en/3`
- `https://www.hskonline.com/en/4`
- `https://www.hskonline.com/en/5`
- `https://www.hskonline.com/en/6`
- `https://www.hskonline.com/en/6/1`
- `https://www.hskonline.com/en/6/2`
- `https://www.hskonline.com/en/6/3`
- `https://www.hskonline.com/en/6/4`
- `https://www.hskonline.com/en/app`
- `https://www.hskonline.com/en/hskexam/date?year=2026`
- `https://www.hskonline.com/en/hskexam/intro`
- `https://www.hskonline.com/en/site/login`
- `https://www.hskonline.com/en/site/signup`

## Authenticated Sources Checked

Inspected after owner login on 2026-06-29. Account-specific private values and
question content are intentionally excluded from this note.

- `https://www.hskonline.com/en/account`
- `https://www.hskonline.com/en/account/update`
- `https://www.hskonline.com/en/account/message`
- `https://www.hskonline.com/en/account/active`
- `https://www.hskonline.com/en/account/feedback`
- `https://www.hskonline.com/en/account/password`
- `https://www.hskonline.com/en/1/1`
- `https://www.hskonline.com/en/1/1/practice?lid=8&sid=4`
- `https://www.hskonline.com/en/1/1/practice?lid=8`
- `https://www.hskonline.com/en/1/my/practice`
- `https://www.hskonline.com/en/1/my/errors`
- `https://www.hskonline.com/en/1/4`
- `https://www.hskonline.com/en/1/4/test?id=347`
- `https://www.hskonline.com/en/1/4/report?pid=771991`
- `https://www.hskonline.com/en/upgrade/index`

## Current Public Product Model

### Positioning

- The public site positions the product as a smarter HSK app using big data and
  artificial intelligence.
- The core funnel is app-first: website introduces the product, exposes some web
  practice views, then pushes app download and account login.
- Website emphasizes convenience, precision, personalized study path, mock tests,
  vocabulary practice, skill training and one-on-one tutoring.

### Language Coverage

The public locale switcher remains broad:

- English
- Simplified Chinese
- Japanese
- Korean
- Vietnamese
- Thai
- Russian
- Spanish
- French
- Indonesian
- German
- Portuguese
- Italian

Upgrade implication for our product: keep Vietnamese as the source/admin
language now, but the data model must keep locale-aware UI strings, content
translations, legal pages, notifications, pricing and app store copy.

### Public Learning Surface

Observed web navigation:

- HSK Level 1 to HSK Level 6.
- Skill pages: Listening, Reading, Writing when applicable, Tests.
- Section rows show progress, correct number/answer number, question type,
  completion state and Single Training.
- Smart Quiz appears as a guided/adaptive practice entry.
- Test pages group Real Mock exam and Mocks.
- Public HSK information includes About Test, Test Plan by year, Test
  Regulation, Mock Tests and external Chinese Test Website references.

Observed HSK 6 examples:

- Listening: choose the consistent sentence, interview questions, passage
  questions.
- Reading: finding incorrect sentence, gap fill, reading comprehension.
- Writing: abbreviated article style.
- Tests: Real Mock exam sets and Mocks sets.

### Identity And Conversion

Public auth model:

- Login by email or phone number.
- Register by email or phone.
- Verification code flow.
- Forgot password.
- App download links.
- Corporate services and upgrade entry points.

Public pages expose the acquisition funnel, while the authenticated surface
confirms the daily learning, repository, report and account-management loops
below.

## Authenticated Product Model

### Logged-In Navigation

After login, the web product adds:

- Profile dropdown with account center and logout.
- HSK level selector for HSK 1-6.
- Skill tabs by level: Listening, Reading, Writing where applicable, Tests and
  My exercise.
- Locale switcher preserves the current path across 13 public locales.

### Practice Player

Observed HSK 1 listening practice mechanics:

- Section rows show progress, correct count/answer count and Single Training.
- Single Training opens a small batch of questions.
- Question player supports audio/image assets, previous/next navigation, answer
  checking, report/correction, collection and note-taking.
- After answering, the learner can see the correct answer, answer analysis,
  answer volume and correct-rate metadata.

Upgrade implication for our product: implement the same learning mechanics with
original/licensed questions, then improve it with clear weak-point tags,
teacher notes, confidence tracking and "learn this concept again" actions.

### Smart Quiz And Entitlement

Smart Quiz is not a simple public practice route for a free account. The
observed route redirects to an upgrade page.

Observed conversion mechanics:

- Free AI-powered proficiency test promise.
- Limited HSK 1-6 access for free users.
- VIP/companion/course packaging.
- Upgrade claims around complete content, AI learning, answer analysis, grammar
  explanations and online teachers.

Upgrade implication for our product: create entitlement tiers, but keep a better
free path than competitors: diagnostic test, daily review, limited mock reports,
and clear upgrade prompts only when a feature is genuinely premium.

### My Exercise Repository

Observed logged-in repository tabs:

- Studying Overview.
- Wrong questions collection.
- Essay tutoring.
- Problem collection.
- My note.

Observed dashboard metrics:

- Per-level exercise overview.
- Progress, total answers, quiz paper count, vocabulary training and study
  duration.
- Skill breakdown by Listening/Reading/Writing where applicable.
- Section-level breakdown with answered count, right count and progress.

Observed wrong-question filters:

- Classification: all/skill-specific.
- Question resource: all/training exercise/past exams/mocks.
- Question type: all plus section-specific types.
- Item actions: report/correction, collection, note and answer analysis.

Upgrade implication for our product: make "My exercise" a first-class learner
workspace, not a secondary archive. Add filters by level, skill, question type,
source, wrong count, due review date, teacher-reviewed status and AI weakness
tag.

### Mock Test Flow

Observed test catalog:

- Real Mock exam set group.
- Mocks set group.
- Each set can show previous score/history when available.

Observed mock intro page:

- Test content table by skill and section.
- Total question count and section timing.
- Start testing action.
- My history section with submission time, right/wrong count, accuracy and
  report link.

Observed report page:

- Total questions, right count, accuracy and time.
- Skill-level score table.
- Question-type score table.
- Answer sheet grouped by section.
- Question number navigation.
- Previous/next question controls.

Upgrade implication for our product: implement the same full attempt lifecycle
and improve the report with:

- CEFR/HSK readiness estimate.
- Weak knowledge points.
- Time-per-question anomalies.
- Recommended drills generated from missed skills.
- Exportable study plan after every mock.

### Account Center

Observed account modules:

- Personal information.
- Edit personal profile.
- My message.
- Member card/coupon exchange.
- Feedback submission.
- Password change.

Observed editable profile fields:

- Avatar.
- Nickname.
- Nationality.
- Current location.
- Gender.
- Age.
- Test goal.
- Target HSK level.

Upgrade implication for our product: implement account center with stronger
privacy and admin controls:

- Profile and goal settings.
- Notifications/messages.
- Coupon/license redemption.
- Feedback/ticket system.
- Password/security settings.
- Account deletion request with audit trail.
- Admin view of users, roles, membership and support tickets.

## Where Our Product Already Matches Or Exceeds Public Model

- HSK 1-9 navigation exists, while public web navigation on HSKOnline focuses on
  HSK 1-6.
- HSK 7-9 Advanced model exists: 98 questions, 210 minutes, five skills.
- Vietnamese-first UI is already standardized in the static product.
- Public modules exist: Learn Online, mock tests, vocabulary, writing, speaking,
  translation, account/auth, content admin, tutoring, corporate, app download,
  HSK info, schedule and regulation.
- PWA shell exists with manifest, service worker and offline page.
- Backend foundation exists in Next.js route handlers.
- PostgreSQL schema, migration, seed and admin promotion scripts exist.
- Source-boundary docs and smoke checks are in place.

## Main Gaps To Close

### 1. Live Backend And Auth

Current state: backend code exists but is not hosted with a production database.

Required upgrade:

- Deploy Next.js backend to Vercel/Render.
- Create Neon/Supabase PostgreSQL.
- Run `db:migrate`, `db:seed`, `db:check`.
- Register first owner account and promote to `super_admin`.
- Connect frontend auth forms to `/api/auth/register`, `/api/auth/login`,
  `/api/auth/logout` and `/api/me`.

Priority: P0.

### 2. Content CMS Instead Of Static JSON

Current state: Content Admin exists in static/local mode.

Required upgrade:

- Build real CMS screens against PostgreSQL:
  - levels
  - skills
  - sections
  - questions
  - options
  - transcripts
  - explanations
  - rubric
  - asset status
  - workflow status
- Add import validation and duplicate detection.
- Add content workflow event log visible to super admin.
- Add role gates: content_admin, teacher, admin, super_admin.

Priority: P0/P1.

### 3. Attempt Persistence And Personal Repository

Current state: static `localStorage` can simulate wrong items, notes and SRS.

Required upgrade:

- Persist answer attempts through `/api/attempts`.
- Store wrong questions, saved questions, notes and due reviews in PostgreSQL.
- Add learner repository API:
  - wrong questions
  - saved items
  - notes
  - essays
  - vocab due reviews
- Add filters by level, skill, source, status, due date and wrong count.
- Add per-question metadata visible to learners:
  - correct answer
  - learner answer
  - answer analysis
  - question source
  - answered volume
  - correct-rate benchmark
  - weak-point tag
- Add learner actions:
  - report/correction
  - save/collect
  - note
  - review later
  - generate similar drill

Priority: P1.

### 4. Real Mock Exam Engine

Current state: UI has timed mock console, seed questions and score logic.

Required upgrade:

- Add mock exam tables/use existing schema for exam sections and question order.
- Persist full test sessions:
  - not_started
  - in_progress
  - autosaved
  - submitted
  - scored
  - review
- Add unanswered review, timer restore, submit confirmation and score report.
- Add post-test weak-point drill generation.
- Add mock intro page with:
  - section table
  - total questions
  - section timing
  - start/continue action
  - previous history
- Add report page with:
  - skill-level score
  - question-type score
  - answer sheet
  - question navigation
  - review controls

Priority: P1.

### 5. Account Center And Support Operations

Current state: frontend has account/auth placeholders and backend route
foundation, but the production account center is not complete.

Required upgrade:

- Profile settings: avatar, nickname, nationality, location, gender, age, test
  goal and target HSK level.
- Security settings: password change, active sessions and account deletion
  request.
- Messages/notifications.
- Feedback/support ticket submission.
- Coupon/license redemption for future paid plans or school seats.
- Super admin user view with roles, membership, support status and learning
  activity summary.

Priority: P1.

### 6. HSK 7-9 Differentiation

Current state: our product already has the product structure for Advanced HSK.

Required upgrade:

- Make HSK 7-9 a flagship module:
  - diagnostic placement into below 7 / HSK 7 / HSK 8 / HSK 9
  - advanced reading packs
  - translation drills
  - speaking recording and teacher/AI rubric
  - academic writing tasks
  - full 98-question mock import workflow
- Build teacher-reviewed original content pipeline.
- Keep clear labels that seed content is not official/proprietary exam content.

Priority: P0/P1 because this is the strongest competitive wedge.

### 7. AI Layer

Current state: local rubric feedback exists, but no real AI service.

Required upgrade:

- AI diagnostic plan.
- AI writing correction with rubric JSON.
- AI translation scoring.
- AI speaking feedback after transcript/audio pipeline.
- Explain-answer assistant.
- Weak-point drill generator.

Priority: P2 after backend/content persistence.

### 8. Product Polish

Public HSKOnline is compact and app-first. Our current web prototype is broader
and more admin-heavy.

Required upgrade:

- Split learner and admin surfaces more clearly.
- Make first viewport a real learner dashboard, not an implementation map.
- Add cleaner course map:
  - level select
  - daily plan
  - due reviews
  - continue last session
  - weak skill cards
- Keep admin/content screens behind a role switch.
- Make upgrade/pricing and app download visually production-grade with original
  assets.
- Add compact level selector rather than a wide HSK 1-9 row on constrained
  screens.
- Keep a calm Vietnamese-first learner UI; move English/internal wording into
  translation backlog.

Priority: P1/P2.

## Proposed Execution Plan

### Sprint A - Production Backend

Deliverables:

- Deployed Next.js backend.
- Live PostgreSQL database.
- Auth forms connected to real APIs.
- User profile persisted.
- Super admin account created.
- Health endpoint returns database configured/ok.

Exit criteria:

- User can register, login, logout.
- `/api/me` returns profile.
- No real secret is committed.

### Sprint B - Learner Data Persistence

Deliverables:

- Practice answer saving.
- Wrong question repository backed by DB.
- Saved notes backed by DB.
- Vocab SRS review persistence.
- Account center reads/writes profile from DB.
- Feedback ticket creation.
- Message/notification list.
- Coupon/license redemption data model.

Exit criteria:

- Refreshing browser keeps learning history from backend, not only
  `localStorage`.
- Profile edits, notes, saved questions and feedback survive device/browser
  changes.

### Sprint C - CMS And Content Workflow

Deliverables:

- Admin question list.
- Import original/licensed question.
- Edit status draft/review/approved/published.
- Advanced HSK 7-9 coverage dashboard from DB.
- Export/import 98-question mock template from DB.

Exit criteria:

- Content admin can add a new HSK 7-9 translation question and publish it.
- Learner sees only published content.

### Sprint D - Mock Exam Engine

Deliverables:

- Real mock attempt model.
- Timer restore/autosave.
- Answer sheet and unanswered review.
- Score report.
- Wrong-answer drill generation.
- Mock history and report review.
- Per-section and per-question-type analytics.

Exit criteria:

- Learner can start a mock, leave page, return, submit, review and get
  generated weak-point practice.

### Sprint E - HSK 7-9 Advanced Flagship

Deliverables:

- Dedicated Advanced dashboard.
- Translation/speaking/writing rubric screens.
- Teacher review queue.
- Original 98-question set import process.
- AI-ready interfaces for writing/translation/speaking scoring.

Exit criteria:

- Product can credibly market HSK 7-9 as a stronger module than competitors,
  while content remains original/licensed.

## Remaining Inspection Boundaries

Already confirmed after login:

- Logged-in account center.
- Practice section structure.
- Single Training player mechanics.
- Smart Quiz upgrade gate.
- My exercise overview.
- Wrong-question repository filters.
- Mock catalog, mock intro and existing mock report.
- Locale switcher behavior on logged-in routes.

Still avoid without explicit action-time approval:

- Starting a new mock attempt, because it may create account history.
- Submitting any practice/test answers.
- Sending feedback/support forms.
- Changing profile/security fields.
- Redeeming coupon/member cards.
- Opening purchase/payment flows beyond read-only plan inspection.

Still unknown or likely app-only:

- Native mobile app onboarding and app QR/login handoff.
- Full VIP/Plus premium content depth.
- Whether HSK 7-9 exists anywhere in their mobile app.
- Teacher/tutoring operations behind paid access.

Do not copy any locked/premium content. Record only product mechanics, states,
navigation, metadata and UX patterns.
