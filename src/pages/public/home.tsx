import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  Mail,
  Sparkles,
  MapPin,
  Briefcase,
  // Award, -- only used by the hidden Certifications stat
  Code2,
  Wrench,
  Layout,
  Server,
  Bot,
  Gauge,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { cn } from '../../lib/utils';
import { leadSentences, linkHost, normalizeList, stripSelfIntro } from '../../lib/text';
import { SHIPPING_META, toShippingStatus } from '../../lib/shipping-status';
import { categoryMeta, isTechCategory, sortCategories } from '../../lib/skill-categories';
import { projectBanner } from '../../lib/project-banner';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Experience = Database['public']['Tables']['experiences']['Row'];

interface Stats {
  projectCount: number;
  experienceYears: number;
  skillCount: number;
  certificateCount: number;
  /** Skill names grouped by their category, for the Skills section. */
  skillsByCategory: Record<string, string[]>;
}

const ROLES = ['Full Stack & Mobile Developer', 'AI Enthusiast', 'Problem Solver'];

/** What I offer, for the Services section. Static on purpose: positioning
    changes far less often than projects or skills, so it doesn't earn a table
    and an admin screen the way the other content types do. */
const SERVICES = [
  {
    icon: Layout,
    title: 'Web Application Development',
    description:
      'Responsive, accessible interfaces in React and TypeScript, built component-first so they stay maintainable as the product grows.',
    covers: ['React', 'TypeScript', 'Tailwind', 'Responsive', 'Accessibility'],
  },
  {
    icon: Server,
    title: 'Full-stack & APIs',
    description:
      'Postgres schema design, authentication, row-level security, and the API layer that connects a front end to real data.',
    covers: ['Postgres', 'Auth', 'RLS', 'REST', 'Supabase'],
  },
  {
    icon: Bot,
    title: 'AI Integration',
    description:
      'Adding LLM-backed features such as chat, summarisation and semantic search to existing products without rebuilding them.',
    covers: ['LLM APIs', 'Chat', 'Summarisation', 'Vector search'],
  },
  {
    icon: Gauge,
    title: 'Performance & Polish',
    description:
      'Bundle and Lighthouse audits, lazy-loaded routes, dark mode, and the accessibility pass most projects skip.',
    covers: ['Lighthouse', 'Code splitting', 'Dark mode', 'A11y'],
  },
] as const;

export function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    projectCount: 0,
    experienceYears: 0,
    skillCount: 0,
    certificateCount: 0,
    skillsByCategory: {},
  });
  const [roleIdx, setRoleIdx] = useState(0);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4]);

  const FALLBACK_BIO =
    'I design and ship modern, performant web apps — turning fuzzy ideas into clean, accessible products you can actually use.';
  const fullBio = profile?.bio || FALLBACK_BIO;
  // Drop any "Hi, I'm <name>" opener (the headline already says it) and keep the
  // hero to a couple of sentences; the full text lives in the About section.
  const heroLead = leadSentences(stripSelfIntro(fullBio), 2);

  // Tech categories only -- Core/Soft Skills live on the Skills page, since
  // they don't belong under a "tech I've worked with" heading.
  const skillCategories = sortCategories(Object.keys(stats.skillsByCategory)).filter(
    isTechCategory
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, featuredRes, expRes, projCount, skillsRes, certCount, expAll] =
          await Promise.all([
            supabase.from('profiles').select('*').limit(1),
            supabase
              .from('projects')
              .select('*')
              .eq('featured', true)
              .order('created_at', { ascending: false }),
            supabase
              .from('experiences')
              .select('*')
              .order('start_date', { ascending: false })
              .limit(3),
            supabase.from('projects').select('id', { count: 'exact', head: true }),
            // Ordered by insertion, not proficiency: within a category the
            // listed sequence is deliberate (React.js before Next.js), and
            // sorting by skill level would shuffle it.
            supabase
              .from('skills')
              .select('id, name, category, proficiency, created_at')
              .order('created_at', { ascending: true }),
            supabase.from('certificates').select('id', { count: 'exact', head: true }),
            supabase.from('experiences').select('start_date, end_date, current'),
          ]);

        if (cancelled) return;

        if (profileRes.data && profileRes.data.length > 0) setProfile(profileRes.data[0]);
        setFeaturedProjects(featuredRes.data || []);
        setExperiences(expRes.data || []);

        // Build [start, end] intervals, then merge overlaps so concurrent roles
        // don't get double-counted. Total experience = union of time worked.
        const now = Date.now();
        const intervals = (expAll.data || [])
          .map(e => {
            const start = new Date(e.start_date).getTime();
            const end = e.current ? now : new Date(e.end_date || e.start_date).getTime();
            return [start, Math.max(start, end)] as [number, number];
          })
          .sort((a: [number, number], b: [number, number]) => a[0] - b[0]);

        let totalMs = 0;
        let cursorStart = -Infinity;
        let cursorEnd = -Infinity;
        for (const [start, end] of intervals) {
          if (start > cursorEnd) {
            if (cursorEnd > cursorStart) totalMs += cursorEnd - cursorStart;
            cursorStart = start;
            cursorEnd = end;
          } else {
            cursorEnd = Math.max(cursorEnd, end);
          }
        }
        if (cursorEnd > cursorStart) totalMs += cursorEnd - cursorStart;

        const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);

        // Grouped by category, strongest first (the query orders by
        // proficiency), so each card leads with the skills worth showing.
        const skillRows = (skillsRes.data || []) as { name: string; category: string }[];
        const byCategory = skillRows.reduce<Record<string, string[]>>((acc, s) => {
          (acc[s.category] ||= []).push(s.name);
          return acc;
        }, {});

        setStats({
          projectCount: projCount.count || 0,
          experienceYears: Math.round(years * 10) / 10,
          skillCount: skillsRes.data?.length || 0,
          certificateCount: certCount.count || 0,
          skillsByCategory: byCategory,
        });
      } catch (err) {
        console.error('home fetch error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* HERO */}
      {/* The header is sticky, not fixed, so it already occupies its 64px of
          layout and this section starts below it. Top padding here is pure
          breathing room -- it does NOT need to clear the header. The old pt-24
          was written as if the header overlapped, which pushed the hero 80px
          down and ran the photo card off the bottom of a laptop screen. */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 pb-12 lg:pb-16">
        {/* Backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-aurora-light dark:bg-aurora" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-60" />

        <div className="container-page relative">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex items-center gap-2"
              >
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  <span>
                    Available for{' '}
                    <span className="text-accent-600 dark:text-accent-300">freelance</span> &amp;{' '}
                    <span className="text-brand-600 dark:text-brand-300">internships</span>
                  </span>
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tightest leading-[0.95] text-balance"
              >
                <span className="block text-secondary-900 dark:text-white">Hello, I'm</span>
                <span className="block heading-gradient">{profile?.name || 'Gaurav Naik'}.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-5 max-w-xl text-base sm:text-lg text-secondary-600 dark:text-secondary-300 text-pretty"
              >
                <span className="inline-flex items-center gap-2 font-mono text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    <span className="text-secondary-700 dark:text-secondary-200">role</span> ={' '}
                    <motion.span
                      key={roleIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-brand-600 dark:text-brand-300"
                    >
                      "{ROLES[roleIdx]}"
                    </motion.span>
                  </span>
                </span>
                {/* Short lead only: the headline above already greets the reader,
                    and the full bio is rendered in the About section below. */}
                <p className="mt-1">{heroLead}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <Button
                  variant="gradient"
                  size="lg"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => navigate('/projects')}
                >
                  View my work
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Mail size={16} />}
                  onClick={() => navigate('/contact')}
                >
                  Get in touch
                </Button>
                <a
                  href={profile?.github_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                >
                  <Github size={16} />
                  GitHub
                  <ArrowUpRight size={14} />
                </a>
              </motion.div>
            </div>

            {/* Right: photo card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                /* Capped on desktop too: lg:max-w-none let the card fill the
                   whole 5/12 column (~490px wide, ~610px tall at 4/5), making
                   the hero taller than the viewport and pushing the stats row
                   out of sight. */
                className="relative mx-auto max-w-sm lg:max-w-md"
              >
                {/* Glow */}
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,theme(colors.brand.500/0.25),transparent_70%)] blur-2xl"
                />

                <div className="relative overflow-hidden rounded-3xl border border-secondary-200/80 dark:border-secondary-800 bg-white dark:bg-secondary-900/50 shadow-xl shadow-secondary-900/[0.04] dark:shadow-black/40">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name || 'Profile'}
                      /* max-h caps the card on short viewports so the whole
                         thing -- including the title overlay -- is visible on
                         entry instead of running off the bottom of the screen.
                         6.5rem = 4rem header + 1.5rem top padding + 1rem slack.
                         On a normal laptop the natural 4:5 height is smaller
                         than this, so the clamp does nothing. */
                      className="aspect-[4/5] w-full object-cover object-center lg:max-h-[calc(100svh-6.5rem)]"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full grid place-items-center bg-secondary-100 dark:bg-secondary-900 lg:max-h-[calc(100svh-6.5rem)]">
                      <div className="grid place-items-center h-24 w-24 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                        <Sparkles size={32} />
                      </div>
                    </div>
                  )}

                  {/* Bottom card. Shrink-to-fit and centered on the photo: as a
                      full-bleed bar (inset-x-4) the icon and text sat hard left
                      with a wide empty gutter beside them. */}
                  <div className="absolute inset-x-4 bottom-4 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-2xl bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border border-white/60 dark:border-white/10 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                          Full Stack & Mobile Developer
                        </div>
                        <div className="text-xs text-secondary-600 dark:text-secondary-400 truncate inline-flex items-center gap-1">
                          {profile?.location && (
                            <>
                              <MapPin size={11} /> {profile.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The floating GitHub / LinkedIn / Email mini-cards that used to
                    sit on the photo's right edge are gone: the hero button row
                    already links GitHub and email, and the footer carries the
                    full social set. */}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-8 sm:py-10">
        <div className="container-page">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Projects', value: stats.projectCount, suffix: '+', icon: Code2 },
              {
                label: 'Years of Experience',
                value: stats.experienceYears,
                suffix: stats.experienceYears >= 1 ? '+' : '',
                icon: Briefcase,
              },
              { label: 'Skills', value: stats.skillCount, suffix: '', icon: Wrench },
              // Certificates are hidden site-wide for now; uncomment to bring
              // the fourth stat back (the grid is sm:grid-cols-4 below).
              // { label: 'Certifications', value: stats.certificateCount, suffix: '', icon: Award },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="surface p-4 sm:p-5"
              >
                <div className="flex items-center gap-2 text-secondary-500 dark:text-secondary-400 text-xs font-mono uppercase tracking-wider">
                  <s.icon size={13} className="text-brand-500" />
                  {s.label}
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-secondary-900 dark:text-white">
                  {loading ? '—' : `${s.value}${s.suffix}`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-16 sm:py-24 border-t border-secondary-200/70 dark:border-secondary-800/70">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Selected work"
              title="Featured"
              highlight="projects"
              subtitle="The work I'm most proud of. Each one taught me something."
              variant="tech"
              className="mb-0"
            />
            <Link
              to="/projects"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
            >
              All projects <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="surface h-80 animate-pulse" />
                ))
              : featuredProjects.length > 0
              ? featuredProjects.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                  >
                    <ProjectCard project={p} />
                  </motion.div>
                ))
              : (
                  <div className="col-span-full surface p-12 text-center text-secondary-600 dark:text-secondary-400">
                    No featured projects yet. Check{' '}
                    <Link to="/projects" className="text-brand-600 dark:text-brand-300 font-semibold">
                      all projects
                    </Link>
                    .
                  </div>
                )}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/projects')}>
              All projects
            </Button>
          </div>
        </div>
      </section>

      {/* SKILLS -- grouped by category so the stack is legible at a glance
          without a trip to the Skills page. */}
      <section className="py-16 sm:py-24 border-t border-secondary-200/70 dark:border-secondary-800/70">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Toolkit"
              title="Tech I've"
              highlight="worked with"
              subtitle="The stack behind the work — front of the app through to the database."
              variant="tech"
              className="mb-0"
            />
            <Link
              to="/skills"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
            >
              All skills <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="surface h-48 animate-pulse" />
              ))}
            </div>
          ) : skillCategories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {skillCategories.map((category, i) => {
                const meta = categoryMeta(category);
                const items = normalizeList(stats.skillsByCategory[category]);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                    className="surface p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                          {items.length} {items.length === 1 ? 'tool' : 'tools'}
                        </div>
                        {/* The category as typed, not the shortened label: these
                            headings read as written ("Frontend Development"). */}
                        <h3 className="mt-1 min-w-0 font-bold tracking-tight text-secondary-900 dark:text-white">
                          {category}
                        </h3>
                      </div>
                    </div>

                    {/* Chips, matching the project cards: a reader scanning for
                        "Flutter" finds it as an object rather than as a word
                        inside a sentence. */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {items.map((name) => (
                        <span key={name} className="chip-brand">
                          {name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="surface p-12 text-center text-secondary-600 dark:text-secondary-400">
              Skills will appear here once they're added.
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/skills')}>
              All skills
            </Button>
          </div>
        </div>
      </section>

      {/* SERVICES -- static positioning copy, deliberately not database-driven:
          what I offer changes far less often than projects or skills do. */}
      <section id="services" className="py-16 sm:py-24 border-t border-secondary-200/70 dark:border-secondary-800/70">
        <div className="container-page">
          <SectionHeader
            eyebrow="Services"
            title="How I can"
            highlight="help"
            subtitle="Available for freelance and contract work. Here's where I'm most useful."
            centered
            variant="tech"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                  className="surface flex h-full flex-col p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                      <Icon size={20} />
                    </div>
                    {/* The number is the overline the project cards carry as a
                        category: these have no category, but they are a set. */}
                    <span className="font-mono text-2xs font-semibold tracking-widest text-secondary-400 dark:text-secondary-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-4 font-bold tracking-tight text-secondary-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-600 dark:text-secondary-300">
                    {service.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {service.covers.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-16 sm:py-24 border-t border-secondary-200/70 dark:border-secondary-800/70">
        <div className="container-page">
          <SectionHeader
            eyebrow="About"
            title="A developer who"
            highlight="ships."
            subtitle="I build clean, accessible, performant interfaces — and care just as much about the API behind them."
            centered
            variant="tech"
          />

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 surface p-6 sm:p-8">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                Full Stack & Mobile Developer
              </h3>
              {/* Full bio lives here; the hero shows only its opening sentences. */}
              <p className="mt-3 text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-line">
                {stripSelfIntro(fullBio)}
              </p>

            </div>

            {/* Contact facts moved out of the bio card into their own column.
                This slot used to hold per-category skill counts, which the
                Skills section below now covers in full. */}
            <div className="lg:col-span-5 surface p-6 sm:p-8">
              <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                Quick facts
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Email', value: profile?.email, href: profile?.email ? `mailto:${profile.email}` : undefined },
                  { label: 'Location', value: profile?.location },
                  { label: 'GitHub', value: 'github.com', href: profile?.github_url },
                  { label: 'LinkedIn', value: 'linkedin.com', href: profile?.linkedin_url },
                ]
                  .filter((d) => d.value)
                  .map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between gap-3 rounded-lg border border-secondary-200/70 dark:border-secondary-800/70 px-3.5 py-2.5"
                    >
                      <span className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                        {d.label}
                      </span>
                      {d.href ? (
                        <a
                          href={d.href}
                          target={d.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-secondary-900 dark:text-secondary-100 hover:text-brand-600 dark:hover:text-brand-300 truncate max-w-[65%]"
                        >
                          {d.value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate max-w-[65%]">
                          {d.value}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE PREVIEW */}
      <section className="py-16 sm:py-24 border-t border-secondary-200/70 dark:border-secondary-800/70">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Career"
              title="Where I've"
              highlight="worked"
              subtitle="Internships, freelance, and side projects shaped the way I build today."
              variant="tech"
              className="mb-0"
            />
            <Link
              to="/experience"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
            >
              Full history <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="surface h-28 animate-pulse" />
                ))
              : experiences.length > 0
              ? experiences.map((e) => <ExperienceRow key={e.id} exp={e} />)
              : (
                  <div className="surface p-10 text-center text-secondary-600 dark:text-secondary-400">
                    Experience entries will appear here.
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-secondary-200/70 dark:border-secondary-800/70 bg-white dark:bg-ink-900 p-8 sm:p-14 text-center">
            <div aria-hidden className="absolute inset-0 bg-aurora-light dark:bg-aurora opacity-90" />
            <div aria-hidden className="absolute inset-0 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-40" />

            <div className="relative">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Let's work together
              </span>
              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tightest text-balance">
                <span className="text-secondary-900 dark:text-white">Have a project </span>
                <span className="heading-gradient">in mind?</span>
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-lg text-secondary-600 dark:text-secondary-300">
                Let's discuss what you're building. Open to freelance projects, internship
                opportunities, and interesting collaborations.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="gradient" size="lg" leftIcon={<Mail size={16} />} onClick={() => navigate('/contact')}>
                  Contact me
                </Button>
                {/* Hidden while the resume page is off the nav.
                <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/resume')}>
                  View resume
                </Button>
                */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cover = projectBanner(project.id, project.image_url);
  const tech = normalizeList(project.tech_stack);
  const cardStatus = toShippingStatus(project.shipping_status);
  return (
    <div className="group relative flex h-full flex-col surface overflow-hidden p-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className={cn(
        'relative m-3 overflow-hidden rounded-xl bg-secondary-100 dark:bg-secondary-900',
        cover.designed ? 'aspect-[1200/630]' : 'aspect-[16/10]'
      )}>
        {cover.src ? (
          cover.designed ? (
            // Composed to fill this exact ratio, so it crops rather than floats.
            <img
              src={cover.src}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <>
              {/* Blurred backdrop so a raw screenshot letterboxes rather than
                  being hard-cropped by object-cover. */}
              <div
                aria-hidden
                className="absolute inset-0 scale-110 bg-cover bg-center blur-xl opacity-40 dark:opacity-25"
                style={{ backgroundImage: `url(${cover.src})` }}
              />
              <img
                src={cover.src}
                alt={project.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </>
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-500/10 to-accent-500/10">
            <Sparkles className="h-10 w-10 text-brand-500/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Inset hairline so the letterboxed screenshot reads as a framed image
            rather than bleeding into the card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-secondary-900/20 dark:ring-white/20"
        />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {project.featured && <span className="chip-accent">Featured</span>}
          {/* Visible by default on touch, where there is no hover to reveal them. */}
          <div className="ml-auto z-20 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="grid h-8 w-8 place-items-center rounded-md bg-black/60 backdrop-blur text-white hover:bg-black/80"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="grid h-8 w-8 place-items-center rounded-md bg-black/60 backdrop-blur text-white hover:bg-black/80"
                aria-label="Live"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Status as a coloured overline rather than a grey chip: it answers
            "is this real?" before the title is read. */}
        {cardStatus && (
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {SHIPPING_META[cardStatus].label}
          </div>
        )}

        <h3 className="mt-1.5 text-lg font-bold tracking-tight text-secondary-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
          {project.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-secondary-600 dark:text-secondary-400 line-clamp-4">
          {project.description && leadSentences(project.description, 2)}
        </p>

        {/* Every technology, not the first four: the stack is what a reader
            scans for, and "+3" hides exactly the one they were looking for. */}
        {tech.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {tech.slice(0, 8).map((t) => (
              <span key={t} className="chip-brand">
                {t}
              </span>
            ))}
            {tech.length > 8 && <span className="chip">+{tech.length - 8}</span>}
          </div>
        )}

        {/* What's shipped gets its own block. Buried in the description it
            reads as more detail; set apart, it reads as evidence. */}
        {project.shipping_note && (
          <div className="mt-4 rounded-r-lg border-l-2 border-brand-500 bg-brand-500/5 px-3 py-2.5">
            <span className="text-xs leading-relaxed text-secondary-700 dark:text-secondary-300">
              {project.shipping_note}
            </span>
          </div>
        )}

        {/* mt-auto pins the action row to the bottom so cards in a row line up
            however much description each one carries. */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20 transition-colors group-hover:bg-brand-500/20">
            View case study
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>

          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 inline-flex max-w-[60%] items-center gap-1.5 rounded-full border border-secondary-200 dark:border-secondary-700 px-3 py-1.5 text-xs font-medium text-secondary-600 dark:text-secondary-300 transition-colors hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-300"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{linkHost(project.live_url)}</span>
            </a>
          )}
        </div>
      </div>


      {/* Stretched link rather than an <a> wrapping the whole card: the GitHub
          and live-app links inside are real anchors, and nesting them in an
          outer anchor is invalid HTML (React warns about it). This overlay
          takes the card-wide click; the inner links sit above it on z-20. */}
      <Link
        to={`/projects/${project.id}`}
        aria-label={`View ${project.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      />
    </div>
  );
}

function ExperienceRow({ exp }: { exp: Experience }) {
  const tech = normalizeList(exp.technologies);
  const start = new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const end = exp.current
    ? 'Present'
    : exp.end_date
    ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';
  return (
    <div className={cn('surface p-5 sm:p-6 hover:border-brand-500/40 transition-colors group')}>
      <div className="flex items-start gap-4">
        <div className="hidden sm:grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 font-black ring-1 ring-inset ring-brand-500/20">
          {(exp.company || '?').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          {/* Company as the accent overline and the role as the heading, the
              same order the project cards use for category and title. */}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {exp.company}
            </div>
            <div className="text-2xs font-mono uppercase tracking-widest text-secondary-500 dark:text-secondary-400">
              {start} — {end}
            </div>
          </div>

          <h3 className="mt-1.5 text-base sm:text-lg font-bold tracking-tight text-secondary-900 dark:text-white">
            {exp.position || exp.title}
          </h3>

          {exp.description && (
            <p className="mt-2 text-sm leading-relaxed text-secondary-600 dark:text-secondary-400 line-clamp-3">
              {exp.description}
            </p>
          )}

          {tech.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {tech.slice(0, 8).map((t) => (
                <span key={t} className="chip-brand">
                  {t}
                </span>
              ))}
              {tech.length > 8 && <span className="chip">+{tech.length - 8}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
