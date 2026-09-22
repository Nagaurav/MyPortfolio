import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, ArrowUpRight, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { PageHero } from '../../components/ui/page-hero';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { linkHost, normalizeList } from '../../lib/text';
import { projectBanner } from '../../lib/project-banner';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

type SortOption = 'date' | 'featured' | 'title';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
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
    projects.forEach((p) => normalizeList(p.tech_stack).forEach((t) => set.add(t)));
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
        selectedTech.length === 0 || selectedTech.every((t) => normalizeList(p.tech_stack).includes(t));
      const catOk = !selectedCategory || p.category === selectedCategory;
      return techOk && catOk;
    });
  }, [projects, selectedTech, selectedCategory]);

  const activeFilters = selectedTech.length + (selectedCategory ? 1 : 0);

  const clearAll = () => {
    setSelectedTech([]);
    setSelectedCategory(null);
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
        {/* Filter + sort bar */}
        <div className="surface p-3 sm:p-4 mb-6 flex flex-wrap items-center gap-2">
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
          // A 3-column grid holding one card leaves two thirds of the row empty,
          // which reads as a failed load. Below three items, narrow and centre
          // the grid so the collection looks deliberate at any size.
          <div
            className={cn(
              'grid gap-5',
              filtered.length === 1 && 'max-w-md mx-auto',
              filtered.length === 2 && 'sm:grid-cols-2 max-w-3xl mx-auto',
              filtered.length > 2 && 'sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
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
  const cover = projectBanner(project.id, project.image_url);
  const tech: string[] = normalizeList(project.tech_stack);
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
          <div className="ml-auto z-20 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
        {/* Category as a coloured overline rather than a grey chip: it labels
            the project before the title is read. */}
        {project.category && (
          <div className="text-2xs font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {project.category}
          </div>
        )}

        <h3 className="mt-1.5 text-lg font-bold tracking-tight text-secondary-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
          {project.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-secondary-600 dark:text-secondary-400 line-clamp-4">
          {project.short_description || project.description}
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

        {/* The result gets its own block. Buried in the description it reads as
            more detail; set apart, it reads as evidence. */}
        {project.outcome && (
          <div className="mt-4 rounded-r-lg border-l-2 border-brand-500 bg-brand-500/5 px-3 py-2.5">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Result: </span>
            <span className="text-xs leading-relaxed text-secondary-700 dark:text-secondary-300">
              {project.outcome}
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
