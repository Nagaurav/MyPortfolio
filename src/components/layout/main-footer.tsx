import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const NAV = [
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

export function MainFooter() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    let active = true;
    supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        if (active && !error && data && data.length > 0) setProfile(data[0]);
      });
    return () => {
      active = false;
    };
  }, []);

  const socials = [
    profile?.github_url && { href: profile.github_url, label: 'GitHub', icon: Github },
    profile?.linkedin_url && { href: profile.linkedin_url, label: 'LinkedIn', icon: Linkedin },
    profile?.email && { href: `mailto:${profile.email}`, label: 'Email', icon: Mail },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Github }[];

  return (
    <footer className="relative mt-24 border-t border-secondary-200/70 dark:border-secondary-800/70 bg-white dark:bg-ink-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
      />

      <div className="container-page py-14 sm:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] text-white text-sm font-black">
                GN
              </span>
              <span className="text-lg font-semibold tracking-tight text-secondary-900 dark:text-white">
                {profile?.name || 'Gaurav Naik'}
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
              {profile?.bio ||
                'Full-stack developer building modern, performant web apps and exploring the edges of AI.'}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-secondary-200 bg-white text-secondary-600 hover:text-brand-600 hover:border-brand-500/40 hover:bg-brand-500/5 transition-colors dark:border-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-400 dark:hover:text-brand-300"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="md:col-span-3">
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-4">
              Sitemap
            </div>
            <ul className="space-y-2.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-1 text-sm text-secondary-700 dark:text-secondary-300 hover:text-brand-600 dark:hover:text-brand-300 transition-colors group"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="md:col-span-4">
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-4">
              Available for work
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
              Open to freelance projects and internship opportunities. Let's build something great.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 transition-colors group"
            >
              Get in touch
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="hairline mt-12" />

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-secondary-500 dark:text-secondary-500">
          <div>© {year} {profile?.name || 'Gaurav Naik'}. All rights reserved.</div>
          <div className="font-mono">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />
            Built with React · Tailwind · Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
