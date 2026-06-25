# Backend Setup

The static GitHub Pages site remains available for public preview. The backend
is implemented in the Next.js app and should be deployed to a Node-compatible
host such as Vercel, Render, Railway, Fly.io, or a VPS, with PostgreSQL on Neon,
Supabase, Railway, Render, or a managed Postgres provider.

## Environment

Copy `.env.example` to `.env.local` for local development:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: at least 32 random characters for signed session cookies.
- `AUTH_COOKIE_NAME`: optional cookie name, defaults to `hsk_session`.

## Database

Apply the schema:

```powershell
psql $env:DATABASE_URL -f docs/postgres-schema.sql
```

The schema creates users, learner profiles, levels, skills, sections,
questions, attempts, answer attempts, learner repository items, vocabulary SRS,
submissions, teacher reviews, subscriptions, organizations, and content workflow
events.

Seed data included in the schema:

- Locales: `vi`, `en`, `zh`.
- Skills: listening, reading, writing, translation, speaking.
- HSK levels 1-9, including HSK 7-9 advanced.
- Subscription plan placeholders: Free, VIP, MAX, Organization.

## Current API Surface

Read endpoints:

- `GET /api/health`: service health and database ping.
- `GET /api/content/levels`: HSK 1-9 level model. Falls back to static seed data
  when `DATABASE_URL` is not configured.
- `GET /api/content/questions?level=7&skill=translation`: question list. Falls
  back to static seed data when `DATABASE_URL` is not configured.
- `GET /api/me`: signed-in user and learner profile.
- `GET /api/attempts`: latest learner attempts.

Write endpoints:

- `POST /api/auth/register`: create learner account and session.
- `POST /api/auth/login`: sign in and create session.
- `POST /api/auth/logout`: clear session cookie.
- `PATCH /api/me`: update profile and target.
- `POST /api/attempts`: save a question answer and add wrong answers to the
  review repository.
- `POST /api/admin/questions`: import an original/licensed question. Requires
  `content_admin`, `admin`, or `super_admin`.

## Create A Super Admin

After registering the first account, promote it directly in PostgreSQL:

```sql
update users
set role = 'super_admin'
where email = 'you@example.com';
```

Other production roles:

- `learner`: normal student account.
- `teacher`: future essay/speaking review account.
- `content_admin`: can import and manage original/licensed content.
- `admin`: operations/admin account.
- `super_admin`: system owner.

## Content Boundary

Only import original or licensed HSK content. Do not import copied SuperTest,
HSKOnline, paid question banks, proprietary audio, screenshots, testimonials, or
legal/policy wording.
