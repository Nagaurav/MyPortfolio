import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code2, Database as DatabaseIcon, Server, Smartphone, Wrench, Brain, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageHero } from '../../components/ui/page-hero';
import { SkillLogo } from '../../components/ui/skill-logo';
import { cn } from '../../lib/utils';

type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
};

const CATEGORY_META: Record<string, { icon: LucideIcon; label: string; hint: string }> = {
  'Frontend Development': { icon: Code2, label: 'Frontend', hint: 'UI, design systems, motion' },
  Frontend: { icon: Code2, label: 'Frontend', hint: 'UI, design systems, motion' },
  'Backend Development': { icon: Server, label: 'Backend', hint: 'APIs, services, business logic' },
  Backend: { icon: Server, label: 'Backend', hint: 'APIs, services, business logic' },
  'Mobile Development': { icon: Smartphone, label: 'Mobile', hint: 'Cross-platform apps' },
  Database: { icon: DatabaseIcon, label: 'Database', hint: 'Schema, queries, scale' },
  DevOps: { icon: Wrench, label: 'DevOps', hint: 'Deploy, infra, CI/CD' },
  'Tools & Technologies': { icon: Wrench, label: 'Tools', hint: 'Editor, version control, glue' },
  'Tools & DevOps': { icon: Wrench, label: 'Tools & DevOps', hint: 'Tooling and deployment' },
  'Soft Skills': { icon: Brain, label: 'Soft Skills', hint: 'How I work with people' },
};

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('category')
          .order('proficiency', { ascending: false });
        if (error) throw error;
        setSkills((data || []) as Skill[]);
      } catch (e) {
        console.error('skills fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [skills]);

  const grouped = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    skills.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => b.proficiency - a.proficiency));
    return map;
  }, [skills]);

  const visibleCategories = activeCat ? [activeCat] : categories;

  const top = useMemo(() => [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, 5), [skills]);

  return (
    <>
      <PageHero
        eyebrow="Stack"
        title="What I"
        highlight="work with."
        subtitle="The tools I reach for, ranked by how confident I am shipping with them in production."
        size="sm"
      />

      <div className="container-page pb-24">
        {/* Top picks strip */}
        {!loading && top.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface p-5 sm:p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-brand-500" />
              <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                Top of stack
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {top.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-secondary-200/70 bg-white p-3 dark:border-secondary-800/70 dark:bg-secondary-900/40"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary-50 dark:bg-secondary-800/60 flex-shrink-0">
                    <SkillLogo skill={s.name} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                      {s.name}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                      {profLabel(s.proficiency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        {!loading && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <CatChip
              active={!activeCat}
              onClick={() => setActiveCat(null)}
              label="All"
              count={skills.length}
            />
            {categories.map((c) => (
              <CatChip
                key={c}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
                label={CATEGORY_META[c]?.label || c}
                count={grouped[c]?.length || 0}
              />
            ))}
          </div>
        )}

        {/* Skills grid by category */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface h-56 animate-pulse" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
              <Wrench size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
              No skills added yet
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              Add skills from the admin to start populating this section.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {visibleCategories.map((cat) => {
              const meta = CATEGORY_META[cat] || { icon: Wrench, label: cat, hint: '' };
              const Icon = meta.icon;
              const items = grouped[cat] || [];
              return (
                <motion.section
                  key={cat}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4 }}
                  className="surface p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-secondary-900 dark:text-white">
                          {meta.label}
                        </h2>
                        {meta.hint && (
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            {meta.hint}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="chip">{items.length} skills</span>
                  </div>

                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    {items.map((s, i) => (
                      <SkillRow key={s.id} skill={s} index={i} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function CatChip({
  active,
  onClick,
  label,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border',
        active
          ? 'bg-brand-500 text-white border-brand-500'
          : 'bg-white text-secondary-700 border-secondary-200 hover:bg-secondary-100 dark:bg-secondary-900/60 dark:text-secondary-200 dark:border-secondary-700 dark:hover:bg-secondary-800/60'
      )}
    >
      {label}
      <span
        className={cn(
          'inline-grid place-items-center h-5 min-w-5 px-1.5 rounded-full text-2xs font-bold',
          active ? 'bg-white/20 text-white' : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SkillRow({ skill, index }: { skill: Skill; index: number }) {
  const pct = Math.max(0, Math.min(5, skill.proficiency)) / 5;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary-100 dark:bg-secondary-800/60 flex-shrink-0">
            <SkillLogo skill={skill.name} className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
            {skill.name}
          </span>
        </div>
        <span className="text-xs font-mono text-secondary-500 dark:text-secondary-400 whitespace-nowrap">
          {profLabel(skill.proficiency)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-800">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-full bg-[linear-gradient(90deg,theme(colors.brand.500),theme(colors.brand.700))]"
        />
      </div>
    </motion.div>
  );
}

function profLabel(level: number) {
  const v = Math.round(Math.max(0, Math.min(5, level)));
  return ['—', 'Learning', 'Familiar', 'Proficient', 'Advanced', 'Expert'][v];
}
