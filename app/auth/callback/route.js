import { NextResponse } from 'next/server';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') ?? '/';
  const destination = redirectTo.startsWith('/') ? redirectTo : '/';
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));

  if (code) {
    const supabase = await createSupabaseRouteHandlerClient(response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}

export async function POST(request) {
  const response = NextResponse.json({ status: 'ok' });
  const { event, session } = await request.json();
  const supabase = await createSupabaseRouteHandlerClient(response);

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await supabase.auth.setSession(session);
  }

  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut();
  }

  return response;
}
