import { NextResponse } from 'next/server';

import { createSupabaseMiddlewareClient } from '@/lib/supabase/server';

export async function middleware(req) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res;
  }

  const supabase = createSupabaseMiddlewareClient(req, res);
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
