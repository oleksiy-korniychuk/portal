import { redirect } from 'next/navigation';

import CredentialsLoginForm from './credentials-login-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Sign in | Oleksiy Portal',
  description: 'Authenticate once at the portal to unlock single sign-on across every app.',
};

export default async function LoginPage({ searchParams }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === 'string' ? params.redirectTo : '/';

  if (user) {
    redirect(redirectTo === '/login' ? '/' : redirectTo);
  }

  return (
    <section className="login">
      <div className="login__card">
        <p className="login__eyebrow">Supabase Auth</p>
        <h1 className="login__title">Sign in once, stay signed in everywhere.</h1>
        <p className="login__description">
          Use your email and password to establish the shared Supabase session. Once the cookie is set for
          <code>.oleksiyk.com</code>, every downstream app recognizes the sign-in without extra prompts.
        </p>
        <CredentialsLoginForm redirectTo={redirectTo} />
        <div className="login__note">
          <p className="login__note-title">Need OAuth?</p>
          <p>
            Enable providers in Supabase and add buttons here that call the same <code>/auth/callback</code> route.
            The portal stays lightweight while supporting whichever credential mix you need.
          </p>
        </div>
      </div>
    </section>
  );
}
