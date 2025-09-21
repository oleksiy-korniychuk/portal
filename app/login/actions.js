'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

function sanitizeRedirect(target) {
  if (typeof target !== 'string') {
    return '/';
  }

  if (!target.startsWith('/')) {
    return '/';
  }

  return target === '/login' ? '/' : target;
}

export async function authenticateWithPassword(prevState, formData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const redirectTo = sanitizeRedirect(formData.get('redirectTo'));

  if (!email) {
    return {
      status: 'error',
      message: 'Please enter an email address.',
    };
  }

  if (!password) {
    return {
      status: 'error',
      message: 'Please enter your password.',
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: 'error',
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Invalid email or password. Please try again.',
    };
  }

  redirect(redirectTo);
}
