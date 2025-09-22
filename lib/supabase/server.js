import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const isProduction = process.env.NODE_ENV === 'production';

function withCookieOverrides(options = {}) {
  const finalOptions = { ...options };

  if (!finalOptions.domain && cookieDomain) {
    finalOptions.domain = cookieDomain;
  }

  if (finalOptions.secure === undefined) {
    finalOptions.secure = isProduction;
  }

  if (finalOptions.sameSite === undefined) {
    finalOptions.sameSite = 'lax';
  }

  return finalOptions;
}

function buildCookie(name, value, options) {
  return { name, value, ...withCookieOverrides(options) };
}

function buildExpiredCookie(name, options) {
  const expiredOptions = { ...(options || {}), maxAge: 0 };
  return buildCookie(name, '', expiredOptions);
}

function handleCookieError(error) {
  if (error.name === 'ReadOnlyError' || error.message.includes('read-only')) {
    // Expected in some contexts
    return;
  }
  console.error('Unexpected cookie setting failure:', error);
  throw error; // Re-throw unexpected failures
}

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
              onSetCookie(name, value, withCookieOverrides(options));
            } catch (error) {
                handleCookieError(error);
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
        cookieStore.set(buildCookie(name, value, options));
      } catch (error) {
        handleCookieError(error);
      }
    },
    (name, options) => {
      try {
        cookieStore.set(buildExpiredCookie(name, options));
      } catch (error) {
        handleCookieError(error);
      }
    },
  );
}

export async function createSupabaseRouteHandlerClient(response) {
  const cookieStore = await cookies();

  return createClient(
    cookieStore,
    (name, value, options) => {
      response.cookies.set(buildCookie(name, value, options));
    },
    (name, options) => {
      response.cookies.set(buildExpiredCookie(name, options));
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
            res.cookies.set(buildCookie(name, value, options));
          });
        },
      },
    },
  );
}
