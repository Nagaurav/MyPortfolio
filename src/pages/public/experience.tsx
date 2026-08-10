import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ChevronRight, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { normalizeList } from '../../lib/text';
import { PageHero } from '../../components/ui/page-hero';

type Experience = {
  id: string;
  title?: string;
  position?: string;
  company: string;
  location?: string;
  type?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description?: string;
  technologies?: string[];
  key_achievements?: string[];
};

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('start_date', { ascending: false });
        if (error) throw error;
        setExperiences((data || []) as Experience[]);
      } catch (e) {
        console.error('experience fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Career"
        title="Experience &"
        highlight="impact."
        subtitle="The places I've worked, the problems I've solved, and the lessons I'm still carrying forward."
        size="sm"
      />

      <div className="container-page pb-24">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface h-40 animate-pulse" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
              <Briefcase size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
              No experience yet
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              Add experiences from the admin to populate this section.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline rail */}
            <div
              aria-hidden
              className="absolute left-5 sm:left-6 top-3 bottom-3 w-px bg-gradient-to-b from-brand-500/40 via-secondary-300/60 to-transparent dark:via-secondary-700/60"
            />

            <ol className="space-y-5">
              {experiences.map((exp, i) => (
                <TimelineItem key={exp.id} exp={exp} index={i} />
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}

function TimelineItem({ exp, index }: { exp: Experience; index: number }) {
  const start = format(new Date(exp.start_date), 'MMM yyyy');
  const end = exp.current
    ? 'Present'
    : exp.end_date
    ? format(new Date(exp.end_date), 'MMM yyyy')
    : '';
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      className="relative pl-14 sm:pl-16"
    >
      {/* Node */}
      <div className="absolute left-0 top-3.5 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-xl bg-white border border-brand-500/30 shadow-sm dark:bg-secondary-900 ring-1 ring-inset ring-brand-500/20">
        <span className="text-base sm:text-lg font-black text-brand-600 dark:text-brand-300">
          {(exp.company || '?').charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="surface p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">
            {exp.title || exp.position}
            <span className="text-secondary-400 mx-1.5">·</span>
            <span className="text-brand-600 dark:text-brand-300">{exp.company}</span>
          </h3>
          {exp.type && <span className="chip-accent">{exp.type}</span>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-secondary-500 dark:text-secondary-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} /> {start} — {end}
          </span>
          {exp.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} /> {exp.location}
            </span>
          )}
          {exp.current && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current
            </span>
          )}
        </div>

        {exp.description && (
          <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300 whitespace-pre-line leading-relaxed">
            {exp.description}
          </p>
        )}

        {(exp.key_achievements?.length || 0) > 0 && (
          <ul className="mt-4 space-y-1.5">
            {exp.key_achievements!.map((a, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-secondary-700 dark:text-secondary-300"
              >
                <ChevronRight
                  size={14}
                  className="mt-0.5 text-brand-500 flex-shrink-0"
                />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}

        {(exp.technologies?.length || 0) > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary-200/70 dark:border-secondary-800/70">
            <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2 flex items-center gap-1.5">
              <Building2 size={12} /> Tech stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {normalizeList(exp.technologies).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.li>
  );
}
