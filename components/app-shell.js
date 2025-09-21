import Link from 'next/link';

import { signOutAction } from '@/app/actions';

export default function AppShell({ user, children }) {

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__branding">
          <Link href="/" className="app-header__home-link">
            <span className="app-header__logo">OK</span>
            <div>
              <div className="app-header__title">Oleksiy Portal</div>
              <div className="app-header__subtitle">Projects, prototypes, and experiments</div>
            </div>
          </Link>
        </div>
        <div className="app-header__cta">
          {user ? (
            <form action={signOutAction} className="app-header__auth-form">
              <input type="hidden" name="redirectTo" value="/" />
              <div className="app-header__user-meta">
                <span className="app-header__user-email">{user.email}</span>
              </div>
              <button type="submit" className="button button--ghost">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="button button--primary">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="app-footer__content">
          Built with Supabase SSO and deployed across <code>*.oleksiyk.com</code>.
        </div>
      </footer>
    </div>
  );
}
