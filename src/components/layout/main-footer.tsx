import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, MapPin, ArrowUpRight, ArrowUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Two balanced columns rather than one tall list -- the single six-item column
// left the footer lopsided once the bio paragraph came out of the brand block.
const NAV_GROUPS = [
  {
    title: 'Work',
    items: [
      { to: '/projects', label: 'Projects' },
      { to: '/skills', label: 'Skills' },
      { to: '/experience', label: 'Experience' },
    ],
  },
  {
    title: 'About',
    items: [
      // Hidden for now -- uncomment to put these pages back in the footer.
      // { to: '/certificates', label: 'Certificates' },
      // { to: '/resume', label: 'Resume' },
      { to: '/contact', label: 'Contact' },
    ],
  },
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
      .then(({ data, error }: { data: Profile[] | null; error: unknown }) => {
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
    <footer className="relative mt-24 overflow-hidden bg-white dark:bg-ink-900">
      {/* Single top rule. A solid border-t used to sit one pixel above this
          gradient hairline, reading as a doubled divider; the gradient is the
          intended detail, so it is the one that stays. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
      />

      {/* Backdrop echoes the hero so the page closes the way it opened. Flipped
          vertically (aurora hot-spot sits at the top edge) and faded out toward
          the bottom so the legal line stays on flat ground. */}
      {/* No negative z-index here: the footer paints its own background, so a
          -z-10 child would render behind it and disappear. These sit in normal
          order and the content below wins by being later in the DOM. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-aurora-light dark:bg-aurora opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-50"
      />

      <div className="container-page relative py-14 sm:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[linear-gradient(135deg,theme(colors.brand.500),theme(colors.brand.700))] text-white text-sm font-black shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
                GN
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-semibold tracking-tight text-secondary-900 dark:text-white">
                  {profile?.name || 'Gaurav Naik'}
                </span>
                <span className="text-2xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  Full Stack & Mobile Developer
                </span>
              </span>
            </Link>

            {/* No bio here: the home page already shows it twice (hero lead and
                About section), and a third copy in the footer read as repetition. */}
            <div className="mt-6">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Available for work
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-secondary-200 bg-white text-secondary-600 hover:text-brand-600 hover:border-brand-500/40 hover:bg-brand-500/5 hover:-translate-y-0.5 transition-all dark:border-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-400 dark:hover:text-brand-300"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Sitemap */}
          {NAV_GROUPS.map((group) => (
            <nav key={group.title} className="md:col-span-2">
              <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-4">
                {group.title}
              </div>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
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
            </nav>
          ))}

          {/* Contact */}
          <div className="md:col-span-4">
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-4">
              Get in touch
            </div>

            <ul className="space-y-3 text-sm">
              {profile?.email && (
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 text-secondary-700 dark:text-secondary-300 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                  >
                    <Mail size={15} className="text-brand-500 shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </a>
                </li>
              )}
              {profile?.location && (
                <li className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                  <MapPin size={15} className="text-brand-500 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </li>
              )}
            </ul>

            <Button
              as={Link}
              to="/contact"
              variant="gradient"
              size="sm"
              className="mt-5"
              leftIcon={<Mail size={15} />}
            >
              Start a conversation
            </Button>
          </div>
        </div>

        <div className="hairline mt-12" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-secondary-500 dark:text-secondary-500">
          <div>© {year} {profile?.name || 'Gaurav Naik'}. All rights reserved.</div>

          <div className="flex items-center gap-4">
            <span className="font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />
              Built with React · Tailwind · Supabase
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="grid h-8 w-8 place-items-center rounded-lg border border-secondary-200 bg-white text-secondary-600 hover:text-brand-600 hover:border-brand-500/40 hover:-translate-y-0.5 transition-all dark:border-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-400 dark:hover:text-brand-300"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
