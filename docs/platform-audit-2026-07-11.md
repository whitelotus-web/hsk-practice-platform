# Platform Audit And Upgrade Priorities - 2026-07-11

This audit covers the deployed static product, the Next.js backend foundation,
the learner flows, PWA behavior, content operations and production readiness.

## Current State

| Area | Status | Evidence |
| --- | --- | --- |
| Desktop UI | Strong | Consistent design system, dark mode, responsive cards and clear learner navigation. |
| Mobile UI | Strong after fixes | Verified at a real 390 px emulated viewport with no horizontal overflow. Mobile account/login actions are available inside the menu. |
| Learning flows | Partial | Practice, SRS, writing, translation, speaking drafts, notes and saved questions work locally. |
| Mock exams | Partial | Timer, answer sheet, submission and skill report exist, but sessions are not stored on a server. |
| HSK 7-9 | Strong product model, weak content depth | Five-skill model, 98-question/210-minute exam structure and admin coverage view exist; full original/licensed bank is still missing. |
| PWA | Working foundation | Manifest, service worker, versioned shell, offline fallback and deep-link shortcuts are aligned. |
| Backend | Builds successfully | Next.js APIs, PostgreSQL scripts, auth helpers and admin routes compile, lint and typecheck. |
| Production accounts/data | Blocked | GitHub Pages frontend still uses localStorage; backend/database are not deployed and connected. |
| Content operations | Partial | JSON import/export and workflow states exist; production CMS, asset storage and review assignment are not complete. |
| Commercial operation | Blocked | Real entitlements, payment, invoicing, support SLA, legal identity and production policies are not configured. |

## Improvements Completed In This Audit

- Fixed the broken manifest reference and service-worker shell cache.
- Added smoke checks that fail when a referenced local asset does not exist.
- Increased static smoke coverage from 49 to 61 checks.
- Removed the unused dashboard variable and restored a clean lint result.
- Replaced hard-coded weekly progress with activity recorded from real local
  learning actions.
- Normalized legacy string notes and newer structured notes.
- Added safe localStorage parsing and write failure handling.
- Enabled URL hash deep links and PWA shortcuts for main product views.
- Added skip navigation, dynamic ARIA labels, mobile-menu state and
  reduced-motion support.
- Removed non-functional hero controls from the keyboard focus order.
- Fixed mobile header/hero constraints and verified no 390 px overflow.
- Removed sample testimonials from the public home page.
- Reworded unsupported AI/big-data claims as local rubric or progress-based
  behavior.

## P0: Required For A Real Public Product

### 1. Deploy Backend And Database

- Deploy the Next.js backend to a server runtime.
- Provision PostgreSQL on Neon or Supabase.
- Configure `DATABASE_URL`, `AUTH_SECRET`, CORS/origin policy and secure cookies.
- Run migrations, seed minimum content and create the first `super_admin`.
- Connect the static learner UI to the API or migrate it into the Next.js app.

Exit criterion: a user can log in on two devices and see the same profile,
notes, wrong questions and progress.

### 2. Persist Attempts And Mock Sessions

- Store every answer attempt with user, question, elapsed time and confidence.
- Store mock state, autosave timestamp, unanswered questions and submission.
- Restore an interrupted exam safely.
- Generate score reports and weak-point drills from server data.

Exit criterion: closing the browser cannot lose a live exam or learning history.

### 3. Production Content Pipeline

- Build original/licensed question, audio, image, transcript and rubric assets.
- Add object storage with signed upload URLs and asset validation.
- Complete draft/review/approved/published workflow with reviewer ownership.
- Prioritize a credible HSK 7-9 original content bank and full 98-question sets.

Exit criterion: learners only receive reviewed published content and every asset
has ownership/source metadata.

### 4. Real Identity, Security And Operations

- Replace local auth simulation with email/phone verification and reset flows.
- Enforce roles and entitlements on the server, never only in JavaScript.
- Add rate limits, audit logs, session management and account deletion workflow.
- Configure legal company name, support contacts, privacy policy and terms.
- Add error monitoring, uptime checks, backups and restore drills.

## P1: Competitive Product Quality

- Adaptive daily plan using real attempt history, SRS due dates and target exam.
- Question analysis with knowledge tags, common traps and similar drills.
- Teacher queues for writing, translation and speaking review.
- AI scoring only behind a structured rubric, confidence score and human review
  path; never present deterministic local rules as AI.
- Real subscription/payment entitlements, coupons, school seats and invoices.
- Product analytics for activation, first completed practice, mock completion,
  retention and HSK 7-9 engagement.

## P2: Scale And Native Apps

- Native iOS/iPadOS/Android shell after API contracts are stable.
- Offline content packs with versioning and conflict-safe synchronization.
- Multi-language publishing workflow; Vietnamese remains the source locale.
- Organization dashboards, class assignment, teacher performance and seat
  management.

## Non-Negotiable Content Boundary

Do not copy competitor branding, visual assets, paid questions, mock papers,
audio, images, testimonials, legal wording or private data. Product mechanics
may be studied; learner content must be original, licensed or otherwise lawful.
