import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function ensureEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
}

function createClient(cookieStore, onSetCookie = () => {}) {
  ensureEnv();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              onSetCookie(name, value, options);
            } catch {
              /* Read-only cookie store in this context, ignore */
            }
          });
        },
      },
    },
  );
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createClient(
    cookieStore,
    (name, value, options) => {
      try {
        cookieStore.set({ name, value, ...options });
      } catch {
        /* Read-only cookie mutation */
      }
    },
    (name, options) => {
      try {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      } catch {
        /* Read-only cookie mutation */
      }
    },
  );
}

export async function createSupabaseRouteHandlerClient(response) {
  const cookieStore = await cookies();

  return createClient(
    cookieStore,
    (name, value, options) => {
      response.cookies.set({ name, value, ...options });
    },
    (name, options) => {
      response.cookies.set({ name, value: '', ...options, maxAge: 0 });
    },
  );
}

export function createSupabaseMiddlewareClient(req, res) {
  ensureEnv();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    },
  );
}
