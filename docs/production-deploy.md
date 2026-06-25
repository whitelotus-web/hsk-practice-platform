# Production Deploy Runbook

This project currently has two deploy targets:

- GitHub Pages for the static public preview at
  `https://whitelotus-web.github.io/hsk-practice-platform/`.
- A Node/Next.js host for the backend APIs in `src/app/api`.

Use this runbook for the backend deployment.

## Recommended First Production Stack

- Backend host: Vercel for the Next.js app.
- Database: Neon PostgreSQL or Supabase PostgreSQL.
- Source of truth: GitHub `main`.

The static GitHub Pages deployment can remain online while the backend is being
deployed. Later, the frontend can be moved fully to the Next.js host when auth,
CMS, and account flows are wired into the UI.

## Secrets

Generate an auth secret:

```powershell
npm run auth:secret
```

Required production environment variables:

```text
DATABASE_URL=postgresql://...
AUTH_SECRET=generated-secret
AUTH_COOKIE_NAME=hsk_session
```

Do not commit `.env.local` or any real connection string.

## Database Bootstrap

After creating the PostgreSQL database and setting `DATABASE_URL` locally in
`.env.local`, run:

```powershell
npm run db:migrate
npm run db:seed
npm run db:check
```

Then create the first learner account through the backend auth endpoint or UI,
and promote it:

```powershell
npm run db:promote-admin -- you@example.com
```

## Vercel Deploy Flow

If using the Vercel dashboard:

1. Import `whitelotus-web/hsk-practice-platform` from GitHub.
2. Keep the framework as Next.js.
3. Set the project root to the repository root.
4. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_COOKIE_NAME`
5. Deploy `main`.

If using the Vercel CLI after login:

```powershell
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add AUTH_SECRET production
npx vercel env add AUTH_COOKIE_NAME production
npx vercel --prod
```

The backend health endpoint after deploy:

```text
https://YOUR-VERCEL-DOMAIN/api/health
```

Expected database status after env vars are configured:

```json
{
  "ok": true,
  "data": {
    "database": {
      "ok": true,
      "configured": true
    }
  }
}
```

## What I Need From The Owner

To deploy this for real, the owner must provide one of these:

- Log in to Vercel and Neon/Supabase in the browser while Codex is open, then
  let Codex continue from the authenticated browser.
- Or paste the database connection string into `.env.local` locally, then tell
  Codex to continue.

Codex should never commit real database URLs, passwords, auth secrets, or API
tokens to GitHub.
