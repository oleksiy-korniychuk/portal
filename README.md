# Oleksiy Portal

Home base for every project running under `*.oleksiyk.com`. The portal handles Supabase authentication once and
relays the signed-in session to any downstream app that shares the parent domain.

## Stack

- Next.js App Router (React 18)
- Supabase SSR helpers (`@supabase/ssr`) for shared session management
- Edge middleware to keep cookies fresh between requests

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your Supabase project details:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to explore the portal. Without the env vars, the layout will render a friendly
configuration warning.

## Auth flow highlights

- `/login` posts credentials to a server action that calls `supabase.auth.signInWithPassword`.
- Successful logins redirect through `/auth/callback`, which finalises the session and scopes cookies to
  `.oleksiyk.com`.
- `middleware.js` wires `@supabase/ssr` to refresh/propagate auth cookies on every request so server components read
  the latest session.
- The optional `POST /auth/callback` endpoint is ready if you later add a client-side listener (`supabase.auth.onAuthStateChange`) to react to session updates without a full refresh.

## Connecting downstream apps

1. Point each app’s Supabase client to the same URL and anon key.
2. Ensure each app runs under a subdomain of `oleksiyk.com` so the cookie scope applies.
3. Add the shared middleware snippet from the design doc to protect routes and redirect to `oleksiyk.com/login` when
   a session is missing.
4. Optionally add an `/auth/callback` route in each app if you need to complete a same-site redirect handoff.

## Updating project tiles

`lib/projects.js` holds the placeholder tiles shown on the homepage. Replace `href`, `status`, and descriptions as
apps ship. The UI automatically labels buttons as “Launch (SSO ready)” when a user is signed in.

## Deployment notes

- Host the portal at `oleksiyk.com` (apex) so cookies automatically cover the subdomains.
- Configure Supabase auth with the same parent domain (`auth.oleksiyk.com`).
- Add production and preview URLs to Supabase redirect settings: the portal, each app, and `/auth/callback` paths.

## Next steps

- Add OAuth providers (Google, GitHub, etc.) by wiring buttons on `/login` that invoke the same `/auth/callback`.
- Layer analytics or feature flags per app by reading user metadata from the shared Supabase session.
- Drop in automated tests (Playwright/Cypress) once routing stabilises to ensure SSO redirects behave across apps.
