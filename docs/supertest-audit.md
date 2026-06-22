# SuperTest / HSKOnline Product Audit

This audit records the product model observed from the public website and the
logged-in web experience. It is a blueprint for a competing product model, not a
copy plan for protected content, brand assets, UI artwork, exam databases, or
paid question banks.

## Positioning

- Smart HSK preparation platform powered by big data and AI.
- Primary promise: pass HSK with structured practice, mock tests, answer
  analysis, and personalized drills.
- Multi-language market coverage is core, not an afterthought.
- Web is a companion/light practice portal; the full commercial surface appears
  to be app-first.

## Language Model

Observed locale switcher:

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

Implementation requirement: every route, learning object title, question
explanation, product plan, notification, and support page must be locale-aware.
The application should store source learning content separately from UI
translation strings.

## Account And Identity

Observed account functions:

- Profile menu with account and logout.
- Personal information page.
- Editable avatar/head portrait.
- Nickname.
- Login account/email.
- Nationality and current location.
- Gender and age.
- Test goal.
- Current HSK preparation level.
- Membership expiration time.
- Feedback form.
- Password change.
- Delete account.
- Message/inbox page.
- Member card/coupon exchange.

Build requirement:

- Auth, profile, goals, subscription status, coupon redemption, inbox,
  feedback, and account deletion must be first-class modules.

## Learning Structure

Observed HSK levels:

- HSK 1 to HSK 6 on current web navigation.
- Writing appears from HSK 3 upward.
- Each level has skill routes: Listening, Reading, Writing where applicable,
  Tests, My exercise.

Observed practice list pattern:

- Section title.
- Progress.
- Correct number / answer number.
- Question type label.
- Locked state for gated sections.
- Single Training link.
- Smart Quiz link.
- Level summary: total answers, right answers, progress, time.

Observed question type taxonomy:

- True or false.
- Match sentences with pictures.
- Match dialogues with pictures.
- Choose the right answer.
- Choose the right pictures.
- Choose the right sentences.
- Fill in the gap.
- Dialogue questions.
- Reading comprehension.
- Arrange sentence order.
- Find the incorrect sentence.
- Choose the consistent sentence.
- Interview questions.
- Passage questions.

Build requirement:

- Model exam content as level -> skill -> section -> item type.
- Item renderer must be polymorphic instead of hardcoded per screen.
- Store attempts, duration, answer history, answer confidence, explanation
  view, note, and collection/mistake state.

## Practice Experience

Observed practice page:

- Small batch practice, often 5 items for a section.
- Audio player for listening questions.
- Image assets for picture matching questions.
- Custom option controls.
- Previous question and next question controls.
- Hidden/visible correct answer and analysis blocks.
- View reports after completion.
- Quiz correction.
- Taking notes.
- Check answer analysis.

Upgrade opportunity:

- Use semantic radio/checkbox/button controls for accessibility.
- Add keyboard navigation.
- Add confidence marking.
- Add immediate adaptive next-step suggestions.
- Add SRS scheduling after wrong/low-confidence answers.

## Mock Test Experience

Observed test list:

- Tests are grouped by level.
- Real-style mock exam sets are listed separately from older/mock sets.
- Test entry page has title, start button, history area, and app promotion.
- Test start page loads all sections into one long session.
- HSK6 example had many audio and image assets, timer, answer areas, and one
  writing textarea.

Build requirement:

- Dedicated test attempt state machine: not_started, in_progress, submitted,
  scored, review.
- Timer must support pause policy, autosave, section jump, unanswered review,
  final confirmation, score report, and post-test drill generation.

## Writing Experience

Observed writing:

- HSK 3 to HSK 6 have writing routes.
- Writing practice includes title input and content textarea.
- HSK6 has original text controls: read original, abbreviated article, show full
  text.
- Save and update actions.
- Reference answer.
- Professional teacher correction upsell/link.
- Essay tutoring is tracked in My exercise.

Upgrade opportunity:

- Add AI correction before paid teacher correction.
- Add rubric scoring: task completion, grammar, vocabulary, cohesion, character
  accuracy, length, and exam timing.
- Add rewrite suggestions, sentence-level comments, vocabulary upgrades, and
  exportable feedback.

## My Exercise / Personal Repository

Observed personal learning pages:

- Studying overview.
- Wrong questions collection.
- Essay tutoring.
- Problem collection.
- My note.

Observed filters:

- Category: all, listening, reading, writing.
- Source: all, training exercise, past exams, mocks.
- Section/question type.

Build requirement:

- Personal repository should support wrong items, starred items, notes, essays,
  weak points, due reviews, and AI-generated drills.
- Filters should include skill, source, section, level, difficulty, last
  answered date, wrong count, confidence, and due date.

## Monetization

Observed subscription model:

- Freemium with gated Smart Quiz and locked sections.
- VIP page with 1 month, 3 months, 6 months, 12 months, and lifetime plan.
- Coupon/member card exchange.
- Professional teacher correction for essays.
- Corporate services.

Build requirement:

- Entitlement service must gate content by plan and feature, not by hardcoded UI.
- Support web payments, app store payments, coupons, trials, teacher correction
  credits, and organization licenses.

## Corporate / B2B

Observed corporate positioning:

- Language training for enterprises.
- Chinese culture training.
- Translation services.
- Enterprise credibility section.

Build requirement:

- Later phase: organizations, classes, teachers, assignments, seat management,
  learning reports, and HR/admin dashboards.

## Data Model Draft

Core tables/entities:

- User, profile, identity provider, session.
- Locale, translation namespace, content translation.
- HskFramework, level, skill, section, question type.
- Question, option, asset, explanation, rubric.
- PracticeSet, mockExam, examSection, examAttempt, answerAttempt.
- AdvancedHskBand for HSK 7-9, translationSubmission, speakingRecording,
  teacherRubricReview.
- Vocabulary, grammarPoint, flashcard, reviewSchedule.
- Mistake, collection, note, essaySubmission, speakingSubmission.
- AiFeedback, generatedDrill, masteryScore, studyPlan.
- SubscriptionPlan, entitlement, payment, coupon, teacherCorrectionCredit.
- Organization, classroom, teacher, learner, assignment.

## Build Principles

- Copy the business and learning model, not protected content.
- Create original/licensed question banks.
- Keep multi-language support in the schema from day one.
- Make AI assist learning, not just chat.
- Turn every mistake into a scheduled review.
- Use accessibility and mobile responsiveness as product quality features.

## 2026-06-19 Re-Audit Notes

Public pages checked:

- `https://www.hskonline.com/`
- `https://www.hskonline.com/en/6/1`
- `https://www.hskonline.com/en/6/2`
- `https://www.hskonline.com/en/6/3`
- `https://www.hskonline.com/en/6/4`
- `https://www.hskonline.com/en/app`
- `https://www.hskonline.com/en/hskexam/index`
- `https://www.hskonline.com/en/hskexam/date?year=2026`
- `https://www.hskonline.com/en/hskexam/intro`
- `https://www.hskonline.com/en/site/login`
- `https://www.hskonline.com/en/site/signup`
- `https://www.hskonline.com/en/site/reset-password`

Additional module checklist observed:

- Public home: hero, Course Design, AI-powered, App Store/Google download,
  specialties, mock tests, vocabulary practice, listening/reading/writing,
  one-on-one tutoring, learner success stories, footer links.
- Learn Online: level navigation, skill tabs, section rows, progress,
  correct number/answer number, Single Training, Smart Quiz, total answers,
  right answers, progress, time, QR/app download panel.
- Tests: HSK level test catalog, Real Mock exam group, Mocks group, locked
  mock sets, test entry/start flow.
- HSK information: About Test per level, Test Plan by year, Test Regulation
  topics, external official test information link.
- Identity: login by email/phone, QR auth entry, remember me, register by
  email/phone, verification code, reset password.
- Account center requirements remain: personal information, messages,
  membership/member card, coupon exchange, feedback, password, delete account.

Implemented in the static prototype after this re-audit:

- Header/footer module routing for Learn Online, About Test, Test Plan,
  Corporate Services, Download App, Upgrade, Content Admin, Account, Auth.
- Mock test catalog with Real Mock exam, Mocks, VIP locking, timed console,
  answer sheet, score report and content-source boundary.
- About Test view with HSK 1-9 selector, level outcome, duration, content,
  target words and provided learning modules.
- HSK 7-9 Advanced extension beyond the audited competitor model: combined
  98-question/210-minute mock metadata, translation/speaking skill tabs,
  rubric feedback, local speaking recording and seed original questions.
- Content Admin extension: HSK 7-9 coverage dashboard, review queue, 98-question
  template export and import support for mock questions/mock sets.
- Test Plan view with year tabs and seed schedule table.
- Test Regulation view with selectable regulation topics and admin/reminder
  notes.
- Download App view with original mobile feature model and TODO app-store links.
- Auth view with login/register/reset/QR auth structure.
- Account center with profile, messages, member card, coupons, feedback,
  password and delete-account panels.
- Tutoring and corporate service modules.

Still intentionally not copied:

- SuperTest name, logo, colors, visual assets, QR codes, app-store badges,
  testimonials, proprietary copy, paid question bank, real/past exam papers,
  audio and image assets.
