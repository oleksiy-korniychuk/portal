'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signOutAction(formData) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const redirectTo = formData?.get?.('redirectTo') || '/';

  revalidatePath('/', 'page');
  redirect(redirectTo);
}
