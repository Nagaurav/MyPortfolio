import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Eye, Calendar, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { PageHero } from '../../components/ui/page-hero';

type Resume = {
  id: string;
  title: string;
  version: string | number;
  file_url: string;
  is_active: boolean;
  created_at: string;
};

export function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, skills: 0, certs: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [r, p, s, c] = await Promise.all([
          supabase.from('resumes').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('skills').select('id', { count: 'exact', head: true }),
          supabase.from('certificates').select('id', { count: 'exact', head: true }),
        ]);
        setResume((r.data as Resume) || null);
        setStats({
          projects: p.count || 0,
          skills: s.count || 0,
          certs: c.count || 0,
        });
      } catch (e) {
        console.error('resume fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Resume"
        title="The"
        highlight="paperwork."
        subtitle="Download the full PDF or skim the highlights below — whichever is faster for you."
        size="sm"
      />

      <div className="container-page pb-24">
        {loading ? (
          <div className="surface h-64 animate-pulse" />
        ) : resume ? (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Main resume card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 surface p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20 flex-shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-white truncate">
                      {resume.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-secondary-500 dark:text-secondary-400">
                      <span>v{resume.version}</span>
                      <span className="text-secondary-300 dark:text-secondary-700">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={11} />
                        Updated {new Date(resume.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="chip-brand whitespace-nowrap">Active</span>
              </div>

              <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                A concise, recruiter-friendly summary of my education, work experience, skills, and
                selected projects. Latest version always reflects current availability.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  as="a"
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="gradient"
                  size="lg"
                  leftIcon={<Download size={16} />}
                >
                  Download PDF
                </Button>
                <Button
                  as="a"
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                  leftIcon={<Eye size={16} />}
                >
                  Preview
                </Button>
              </div>

              <div className="hairline my-8" />

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Projects', value: stats.projects, href: '/projects' },
                  { label: 'Skills', value: stats.skills, href: '/skills' },
                  { label: 'Certs', value: stats.certs, href: '/certificates' },
                ].map((s) => (
                  <Link
                    key={s.label}
                    to={s.href}
                    className="group rounded-xl border border-secondary-200/70 dark:border-secondary-800/70 p-4 hover:border-brand-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                        {s.label}
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="text-secondary-400 group-hover:text-brand-500 transition-colors"
                      />
                    </div>
                    <div className="mt-1 text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
                      {s.value}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Side: quick links */}
            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-2 surface p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-brand-500" />
                <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  Prefer to browse?
                </div>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Explore the live version
              </h3>
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                Everything in the PDF, but interactive — with project demos, repo links, and detail
                pages.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  { to: '/projects', label: 'Projects', desc: 'Featured work and case studies' },
                  { to: '/skills', label: 'Skills', desc: 'Proficiency by category' },
                  { to: '/experience', label: 'Experience', desc: 'Career timeline' },
                  { to: '/certificates', label: 'Certificates', desc: 'Verified credentials' },
                  { to: '/contact', label: 'Contact', desc: 'Get in touch' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="group flex items-center justify-between rounded-lg border border-secondary-200/70 dark:border-secondary-800/70 px-3.5 py-3 hover:border-brand-500/40 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-secondary-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300">
                        {l.label}
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">{l.desc}</div>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-secondary-400 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                ))}
              </div>
            </motion.aside>
          </div>
        ) : (
          <div className="surface p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
              <FileText size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
              No resume available
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              An active resume hasn't been uploaded yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
