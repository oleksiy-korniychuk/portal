# Goal

* One portal (home base) that lists projects (title, blurb, link).
* Visiting any app from the portal should “already be signed in” if you signed in at the portal.
* Keep it elegant, debuggable, and cheap. Minimize moving parts.

# The cleanest approach (stay on Supabase)

Use **one Supabase project** as the single identity store and **one parent domain** so cookies can be shared across all your apps.

## 1) Domain & hosting layout

* Use domain: `oleksiyk.com`
* Deploy everything on subdomains via Vercel:

  * Portal: just `oleksiyk.com`
  * Apps: `app1.oleksiyk.com`, `app2.oleksiyk.com`, …
* Set up a **custom Supabase Auth domain** under the same parent, e.g. `auth.oleksiyk.com`.
  Rationale: first-party auth cookies scoped to the parent domain can be read by all subdomains (subject to how the cookie is set; see “Gotchas” below).

## 2) One Supabase project for all apps

* Point every app’s Supabase client to the **same** Supabase URL/anon key.
* This gives you a single user table and consistent JWTs across apps.
* Each app can have its own schema: `workouts.*`, `dmi.*`, etc.
* Enforce isolation with RLS and schema-scoped roles/policies.

## 3) Cookie-based SSO across subdomains

Target behavior:

* Log in once (at portal).
* The auth cookies (httpOnly) are valid for `*.oleksiyk.com`.
* Each app’s server (Next.js or React + a tiny Node edge) reads the cookie, creates a Supabase server client, and treats you as authenticated without another login prompt.

Implementation notes (Next.js 15 with plain JavaScript + AppRouter):

* Use `@supabase/auth-helpers-nextjs` (or the official server client) in **server components** and **middleware**.
* In each app:

  * Add an **Edge Middleware** that checks a session on protected routes. If no session, redirect to the portal’s `/login` (or a shared `/auth` app).
  * In layouts/loaders, call the server client to get `getUser()` for SSR.

Minimal middleware sketch (Conver to plain JavaScript when implementing):

```ts
// middleware.ts (per app)
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: Request) {
  const res = NextResponse.next();
  const supabase = createServerClient({ req, res }); // reads httpOnly cookies
  const { data: { user } } = await supabase.auth.getUser();

  // Example: protect everything under /app
  const url = new URL(req.url);
  if (url.pathname.startsWith('/app') && !user) {
    url.hostname = 'oleksiyk.com';
    url.pathname = '/login';
    url.searchParams.set('redirectTo', req.url);
    return NextResponse.redirect(url);
  }
  return res;
}
```

Server usage sketch (Conver to JavaScript when implementing):

```ts
// app/page.tsx (server component)
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export default async function Page() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // render with user info if present
}
```

## 4) The portal itself

* A simple Next.js site that:

  * Shows your project tiles (title, description, link).
  * Has `/login` using Supabase Auth (email link, OAuth, etc.).
  * After login, redirect back to the portal home.
* Because cookies are shared, clicking any app tile lands you in that app **already authenticated**.

## 5) Authorization model

* Keep **auth** centralized (one project).
* Each app can still enforce its own **authorization** via RLS policies / roles (e.g., per-app role claims in the JWT) or app-local checks driven by the user’s metadata.

---

# Practical “gotchas” and how to avoid them

1. **Cookie scope & SameSite**

   * To share across subdomains, your auth cookies must have `Domain=.oleksiyk.com`. With a **custom Supabase Auth domain** set under your apex, cookies typically become first-party. Verify cookie attributes in the browser (Application → Cookies) after login.
   * If cookies end up scoped only to `auth.oleksiyk.com`, the apps won’t see them. In that case, add a tiny `/auth/callback` page in each app that completes the login (still first-party) after a redirect from the portal. Keep the redirect *same-site* to avoid third-party cookie issues.

2. **Multiple environments**

   * Use `dev.oleksiyk.local` or a dedicated dev domain (e.g., `dev.oleksiyk.com`) with its own Supabase **project** or at least a separate auth domain to avoid cookie collisions between dev and prod.

3. **Token/claims consistency**

   * Since all apps use one Supabase project, attach per-app flags to `user_metadata` or JWT custom claims for authorization checks. Keep it simple: `{ "roles": ["workouts:admin", "notes:viewer"] }`.

4. **Vercel + Edge Middleware**

   * Middleware must be fast and side-effect-free. Only do lightweight `getUser()` checks there; put heavy logic in server components or route handlers.

5. **SSO handoff UX**

   * If you do need a redirect handoff:

     * Portal detects logged-in state, generates a normal Supabase `redirectTo` login for the target app (`/auth/callback`) **on the app’s subdomain**, and sends the user there.
     * The app route finalizes the session and returns the user to the intended page.
     * It feels like SSO but is standards-compliant and avoids passing tokens in query strings.

---

# Step-by-step checklist (recommended path)

1. **Pick a domain strategy**

   * Apex: `oleksiyk.com`
   * Portal: `oleksiyk.com`
   * Apps: `*.oleksiyk.com`
   * Supabase Auth custom domain: `auth.oleksiyk.com`.

2. **Configure Supabase**

   * Single project for all apps.
   * Configure **redirect URLs** for portal and every app (login/logout/callback).
   * Turn on providers you use (email magic link, Google, etc.).

3. **Portal build (Next.js)**

   * Add Supabase login on `/login`.
   * Store return URL (`redirectTo`) during auth.
   * Simple projects grid → links to apps.

4. **Each app**

   * Add Supabase server client + **Edge Middleware** to protect routes.
   * If cookies are shared → you’re done.
   * If not shared → implement `/auth/callback` that finalizes login when redirected from portal (still using Supabase’s standard flow per app). Middleware redirects unauthenticated users there.

5. **Authorization**

   * Add light role checks in server code/RLS.
   * Keep per-app config in user metadata, not hardcoded.

6. **Test**

   * Log in at the portal.
   * Visit each app directly and via the portal.
   * Verify cookies visible to subdomains; confirm `getUser()` works server-side without extra login.

---

# Why this is “most effective & elegant”

* Minimal moving parts: Supabase remains your IdP; Vercel hosts everything; no extra gateways unless needed.
* First-party cookies across subdomains is the simplest true SSO you can run as a solo dev.
* Clear escape hatches:

  * If cookie sharing is tricky in your setup, use the per-app `/auth/callback` handoff.
  * If you later want more polish/enterprise features, swap in a dedicated IdP without re-writing apps—your portal UI stays the same.

If you want, I can draft a small template repo (portal + one app) showing: shared domain config, login page, middleware, and the optional `/auth/callback` handoff so you can copy-paste the pattern.

