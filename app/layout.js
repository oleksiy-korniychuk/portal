import './globals.css';

import AppShell from '@/components/app-shell';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Oleksiy | Projects Portal',
  description: 'One home base to navigate across apps with a shared Supabase auth layer.',
};

export default async function RootLayout({ children }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <html lang="en">
        <body>
          <div className="app-shell">
            <main className="app-main">
              <div className="missing-env">
                <h1>Supabase configuration required</h1>
                <p>
                  Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
                  <code>.env.local</code> so the portal can connect to your shared Supabase project.
                </p>
              </div>
            </main>
          </div>
        </body>
      </html>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
