import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, Search, ArrowUpRight, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { PageHero } from '../../components/ui/page-hero';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

type SortOption = 'date' | 'featured' | 'title';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let q = supabase.from('projects').select('*');
        if (sortBy === 'featured') {
          q = q.order('featured', { ascending: false }).order('created_at', { ascending: false });
        } else if (sortBy === 'title') {
          q = q.order('title', { ascending: true });
        } else {
          q = q.order('created_at', { ascending: false });
        }
        const { data, error } = await q;
        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('projects fetch error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sortBy]);

  const allTech = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => (p.tech_stack || []).forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const techOk =
        selectedTech.length === 0 || selectedTech.every((t) => (p.tech_stack || []).includes(t));
      const catOk = !selectedCategory || p.category === selectedCategory;
      const ql = query.toLowerCase().trim();
      const qOk =
        !ql ||
        p.title?.toLowerCase().includes(ql) ||
        p.description?.toLowerCase().includes(ql) ||
        p.short_description?.toLowerCase().includes(ql) ||
        (p.tech_stack || []).some((t: string) => t.toLowerCase().includes(ql));
      return techOk && catOk && qOk;
    });
  }, [projects, selectedTech, selectedCategory, query]);

  const activeFilters = selectedTech.length + (selectedCategory ? 1 : 0) + (query ? 1 : 0);

  const clearAll = () => {
    setSelectedTech([]);
    setSelectedCategory(null);
    setQuery('');
  };

  return (
    <>
      <PageHero
        eyebrow={`${projects.length || 0} projects`}
        title="Things I've"
        highlight="built."
        subtitle="A collection of products, prototypes, and experiments — each one a small story about a problem I wanted to solve."
        size="sm"
      />

      <div className="container-page pb-24">
        {/* Search + sort bar */}
        <div className="surface p-3 sm:p-4 mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
            <input
              type="text"
              placeholder="Search projects, tech, descriptions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'inline-flex items-center gap-2 h-11 px-3.5 rounded-lg border text-sm font-medium transition-colors',
              showFilters || activeFilters > 0
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100/70 dark:hover:bg-secondary-800/60'
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1 inline-grid h-5 min-w-5 px-1.5 place-items-center rounded-full bg-brand-500 text-white text-2xs font-bold">
                {activeFilters}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input w-auto pl-3 pr-8"
          >
            <option value="date">Latest first</option>
            <option value="featured">Featured first</option>
            <option value="title">A — Z</option>
          </select>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="surface p-4 sm:p-5 mb-6 space-y-4"
          >
            {allCategories.length > 0 && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2">
                  Category
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.map((c) => (
                    <FilterChip
                      key={c}
                      active={selectedCategory === c}
                      onClick={() => setSelectedCategory((cur) => (cur === c ? null : c))}
                    >
                      {c}
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}
            {allTech.length > 0 && (
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2">
                  Tech stack
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTech.map((t) => (
                    <FilterChip
                      key={t}
                      active={selectedTech.includes(t)}
                      onClick={() =>
                        setSelectedTech((cur) =>
                          cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
                        )
                      }
                    >
                      {t}
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}
            {activeFilters > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  {filtered.length} of {projects.length} match
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-300 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X size={14} /> Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface h-96 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
              <Sparkles size={22} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">
              No matching projects
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {activeFilters > 0
                ? 'Try clearing some filters.'
                : "I haven't added any projects yet."}
            </p>
            {activeFilters > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll} className="mt-5">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors border',
        active
          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
          : 'bg-white text-secondary-700 border-secondary-200 hover:bg-secondary-100 dark:bg-secondary-900/60 dark:text-secondary-200 dark:border-secondary-700 dark:hover:bg-secondary-800/60'
      )}
    >
      {children}
    </button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const tech: string[] = project.tech_stack ?? [];
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block surface overflow-hidden p-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100 dark:bg-secondary-900">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-500/10 to-accent-500/10">
            <Sparkles className="h-10 w-10 text-brand-500/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {project.featured && <span className="chip-accent">Featured</span>}
          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <div className="p-5 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
            {project.category && <span>{project.category}</span>}
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {project.title}
          </h3>
          <p className="mt-1.5 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
            {project.short_description || project.description}
          </p>
        </div>

        {tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tech.slice(0, 4).map((t) => (
              <span key={t} className="chip-brand">
                {t}
              </span>
            ))}
            {tech.length > 4 && <span className="chip">+{tech.length - 4}</span>}
          </div>
        )}

        <div className="mt-1 pt-3 border-t border-secondary-200/70 dark:border-secondary-800/70 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
            View details
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="flex items-center gap-3 text-secondary-500 dark:text-secondary-400">
            {project.github_url && <Github size={15} />}
            {project.live_url && <ExternalLink size={15} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
