import Link from 'next/link';

import ProjectCard from '@/components/project-card';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { projects } from '@/lib/projects';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Portal</p>
          <h1 className="hero__title">One home for every experiment.</h1>
          <p className="hero__body">
            Sign in once, explore faster. This hub knows about all of the apps running on
            <span className="hero__domain"> *.oleksiyk.com</span> and keeps your Supabase session in sync as you
            jump between them.
          </p>
          <div className="hero__actions">
            {isAuthenticated ? (
              <Link href="#projects" className="button button--primary">
                Browse projects
              </Link>
            ) : (
              <Link href="/login" className="button button--primary">
                Sign in to unlock SSO
              </Link>
            )}
            <Link href="#architecture" className="button button--ghost">
              Architecture notes
            </Link>
          </div>
          <div className="hero__session">
            {isAuthenticated ? (
              <span>Signed in as {user.email}</span>
            ) : (
              <span>No Supabase session detected.</span>
            )}
          </div>
        </div>
        <div className="hero__card">
          <div className="hero__card-title">SSO status</div>
          <ul className="hero__card-list">
            <li>
              <span className="hero__card-label">Auth domain</span>
              <span className="hero__card-value">auth.oleksiyk.com</span>
            </li>
            <li>
              <span className="hero__card-label">Cookie scope</span>
              <span className="hero__card-value">.oleksiyk.com</span>
            </li>
            <li>
              <span className="hero__card-label">Shared Supabase project</span>
              <span className="hero__card-value">true</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="projects" id="projects">
        <header className="section-header">
          <div>
            <p className="section-header__eyebrow">Projects</p>
            <h2 className="section-header__title">Everything under *.oleksiyk.com</h2>
          </div>
          <p className="section-header__description">
            These tiles are placeholders. Update them as apps mature—each one should point to a subdomain
            wired to the shared Supabase project for seamless single sign-on.
          </p>
        </header>
        <div className="projects__grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} isAuthenticated={isAuthenticated} />
          ))}
        </div>
      </section>

      <section className="architecture" id="architecture">
        <header className="section-header">
          <div>
            <p className="section-header__eyebrow">Architecture</p>
            <h2 className="section-header__title">Shared auth, isolated apps</h2>
          </div>
        </header>
        <div className="architecture__grid">
          <div className="architecture__card">
            <h3>Single Supabase project</h3>
            <p>
              Every app uses the same Supabase URL and anon key. Keep per-app data siloed by schema and RLS
              policies while leveraging a consistent identity store.
            </p>
          </div>
          <div className="architecture__card">
            <h3>Parent domain cookies</h3>
            <p>
              A custom auth domain like <code>auth.oleksiyk.com</code> issues first-party cookies scoped to
              <code>.oleksiyk.com</code>, so each subdomain can read the session server-side.
            </p>
          </div>
          <div className="architecture__card">
            <h3>Edge middleware guards</h3>
            <p>
              Downstream apps add lightweight middleware to require a session on protected routes, redirecting
              back here when someone needs to sign in.
            </p>
          </div>
          <div className="architecture__card">
            <h3>Optional handoff flow</h3>
            <p>
              If cookies ever misbehave, use an <code>/auth/callback</code> route per app to finalize a login on
              same-site redirects—no JWTs in query strings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
