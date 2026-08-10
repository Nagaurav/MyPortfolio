import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  Mail,
  Linkedin,
  Sparkles,
  MapPin,
  Briefcase,
  Award,
  Code2,
  Wrench,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { cn } from '../../lib/utils';
import { leadSentences, normalizeList, stripSelfIntro } from '../../lib/text';
import type { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Experience = Database['public']['Tables']['experiences']['Row'];

interface Stats {
  projectCount: number;
  experienceYears: number;
  skillCount: number;
  certificateCount: number;
  skillCategories: Record<string, number>;
}

const ROLES = ['Full-stack Developer', 'AI Enthusiast', 'UI Engineer', 'Problem Solver'];

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
    skillCategories: {},
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
              .order('created_at', { ascending: false })
              .limit(3),
            supabase
              .from('experiences')
              .select('*')
              .order('start_date', { ascending: false })
              .limit(3),
            supabase.from('projects').select('id', { count: 'exact', head: true }),
            supabase.from('skills').select('id, category'),
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

        const skillRows = (skillsRes.data || []) as { category: string }[];
        const categories = skillRows.reduce<Record<string, number>>((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {});

        setStats({
          projectCount: projCount.count || 0,
          experienceYears: Math.round(years * 10) / 10,
          skillCount: skillsRes.data?.length || 0,
          certificateCount: certCount.count || 0,
          skillCategories: categories,
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
      {/* The header is transparent until scrolled, so the hero sits underneath it.
          Top padding must therefore clear the 64px header -- pt-8 did not, which
          hid the availability badge behind the header on small screens. */}
      <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-28 pb-16 lg:pb-24">
        {/* Backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-aurora-light dark:bg-aurora" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-60" />

        <div className="container-page relative">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2"
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
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tightest leading-[0.95] text-balance"
              >
                <span className="block text-secondary-900 dark:text-white">Hello, I'm</span>
                <span className="block heading-gradient">{profile?.name || 'Gaurav Naik'}.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-6 max-w-xl text-lg sm:text-xl text-secondary-600 dark:text-secondary-300 text-pretty"
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
                className="mt-8 flex flex-wrap items-center gap-3"
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
                className="relative mx-auto max-w-md lg:max-w-none"
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
                      className="aspect-[4/5] w-full object-cover object-center"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full grid place-items-center bg-secondary-100 dark:bg-secondary-900">
                      <div className="grid place-items-center h-24 w-24 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                        <Sparkles size={32} />
                      </div>
                    </div>
                  )}

                  {/* Bottom card */}
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/85 dark:bg-ink-900/85 backdrop-blur-md border border-white/60 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                          {profile?.title || 'Full-stack Developer'}
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

                {/* Floating social mini-cards */}
                <div className="absolute -right-3 xl:-right-6 top-10 hidden lg:flex flex-col gap-2">
                  {[
                    { icon: Github, href: profile?.github_url, label: 'GitHub' },
                    { icon: Linkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
                    { icon: Mail, href: profile?.email ? `mailto:${profile.email}` : undefined, label: 'Email' },
                  ]
                    .filter((s) => !!s.href)
                    .map((s) => (
                      <a
                        key={s.label}
                        href={s.href!}
                        target={s.href!.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 dark:bg-secondary-900/95 backdrop-blur border border-secondary-200/80 dark:border-secondary-800 text-secondary-700 dark:text-secondary-200 shadow-md hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-500/40 transition-colors"
                      >
                        <s.icon size={16} />
                      </a>
                    ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-8 sm:py-10">
        <div className="container-page">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Projects', value: stats.projectCount, suffix: '+', icon: Code2 },
              {
                label: 'Years of Experience',
                value: stats.experienceYears,
                suffix: stats.experienceYears >= 1 ? '+' : '',
                icon: Briefcase,
              },
              { label: 'Skills', value: stats.skillCount, suffix: '', icon: Wrench },
              { label: 'Certifications', value: stats.certificateCount, suffix: '', icon: Award },
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

      {/* ABOUT */}
      <section id="about" className="py-16 sm:py-24">
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
                {profile?.title || 'Full-stack developer & AI enthusiast'}
              </h3>
              {/* Full bio lives here; the hero shows only its opening sentences. */}
              <p className="mt-3 text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-line">
                {stripSelfIntro(fullBio)}
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
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
                      className="flex items-center justify-between rounded-lg border border-secondary-200/70 dark:border-secondary-800/70 px-3.5 py-2.5"
                    >
                      <span className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                        {d.label}
                      </span>
                      {d.href ? (
                        <a
                          href={d.href}
                          target={d.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-secondary-900 dark:text-secondary-100 hover:text-brand-600 dark:hover:text-brand-300 truncate max-w-[60%]"
                        >
                          {d.value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate max-w-[60%]">
                          {d.value}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {Object.keys(stats.skillCategories).length > 0
                ? Object.entries(stats.skillCategories)
                    .slice(0, 4)
                    .map(([category, count], i) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="surface p-5"
                      >
                        <div className="text-2xl sm:text-3xl font-black tracking-tight heading-gradient">
                          {count}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          {category}
                        </div>
                        <div className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">
                          {count > 1 ? 'skills' : 'skill'}
                        </div>
                      </motion.div>
                    ))
                : ['Frontend', 'Backend', 'Database', 'DevOps'].map((c) => (
                    <div key={c} className="surface p-5">
                      <div className="text-2xl sm:text-3xl font-black tracking-tight heading-gradient">—</div>
                      <div className="mt-1 text-sm font-semibold text-secondary-900 dark:text-secondary-100">{c}</div>
                      <div className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">add skills</div>
                    </div>
                  ))}
            </div>
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
              subtitle="A few things I've built recently. Each one taught me something."
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
                    transition={{ duration: 0.4, delay: i * 0.06 }}
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
                Open to freelance projects, internship opportunities, and interesting collaborations.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="gradient" size="lg" leftIcon={<Mail size={16} />} onClick={() => navigate('/contact')}>
                  Contact me
                </Button>
                <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />} onClick={() => navigate('/resume')}>
                  View resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const tech = normalizeList(project.tech_stack);
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block surface overflow-hidden p-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100 dark:bg-secondary-900">
        {project.image_url ? (
          <>
            {/* Blurred backdrop so screenshots letterbox rather than hard-crop. */}
            <div
              aria-hidden
              className="absolute inset-0 scale-110 bg-cover bg-center blur-xl opacity-40 dark:opacity-25"
              style={{ backgroundImage: `url(${project.image_url})` }}
            />
            <img
              src={project.image_url}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-500/10 to-accent-500/10">
            <Sparkles className="h-10 w-10 text-brand-500/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {project.featured && <span className="chip-accent">Featured</span>}
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <div className="p-5">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
          {project.short_description || project.description}
        </p>
        {tech.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tech.slice(0, 4).map((t) => (
              <span key={t} className="chip-brand">
                {t}
              </span>
            ))}
            {tech.length > 4 && <span className="chip">+{tech.length - 4}</span>}
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
          View details
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function ExperienceRow({ exp }: { exp: Experience }) {
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
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">
              {exp.position || exp.title}{' '}
              <span className="text-brand-600 dark:text-brand-300 font-semibold">@ {exp.company}</span>
            </h3>
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              {start} — {end}
            </div>
          </div>
          {exp.description && (
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">{exp.description}</p>
          )}
          {(exp.technologies?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(exp.technologies ?? []).slice(0, 5).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
