import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  Globe,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { normalizeList } from '../../lib/text';
import type { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

/**
 * A project's "live" link is not always a website -- mobile apps ship to an app
 * store instead. Label and display the link for what it actually is, so a Play
 * Store listing does not read as "Live demo" pointing at a raw query string.
 */
function describeLiveUrl(url: string): { label: string; display: string; isStore: boolean } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'play.google.com') {
      // Listings are /store/apps/details?id=<package>; the package is the only
      // human-meaningful part of that URL.
      const pkg = parsed.searchParams.get('id');
      return { label: 'Get it on Google Play', display: pkg ?? 'Google Play', isStore: true };
    }

    if (host === 'apps.apple.com' || host === 'itunes.apple.com') {
      const name = parsed.pathname.split('/').find(part => part.startsWith('id'));
      return { label: 'View on the App Store', display: name ?? 'App Store', isStore: true };
    }

    const path = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
    return { label: 'Live demo', display: host + path, isStore: false };
  } catch {
    // Not a parseable URL -- show it verbatim rather than dropping the link.
    return { label: 'Live demo', display: url, isStore: false };
  }
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Prefer the gallery; fall back to the single cover for rows predating it.
  const gallery = project?.image_urls?.length
    ? project.image_urls
    : project?.image_url
      ? [project.image_url]
      : [];

  const tech = normalizeList(project?.tech_stack);
  const liveLink = project?.live_url ? describeLiveUrl(project.live_url) : null;

  const step = useCallback(
    (delta: number) => {
      setActiveImage(current => {
        const count = gallery.length;
        if (count === 0) return 0;
        return (current + delta + count) % count;
      });
    },
    [gallery.length]
  );

  // Left/right arrows step through the gallery. Bound to the window rather than
  // a focusable wrapper so it works on page load, without the reader first
  // having to click a thumbnail to give the gallery focus.
  useEffect(() => {
    if (gallery.length < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      // Never steal arrows from text entry or a native widget that uses them.
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      ) {
        return;
      }

      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gallery.length, step]);

  useEffect(() => {
    async function fetchProject() {
      // Navigating to a different project must start at its first image,
      // otherwise the index carries over from the previous project's gallery.
      setActiveImage(0);

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 rounded bg-secondary-200 dark:bg-secondary-800" />
          <div className="h-12 w-2/3 rounded bg-secondary-200 dark:bg-secondary-800" />
          <div className="h-4 w-1/2 rounded bg-secondary-200 dark:bg-secondary-800" />
          <div className="mx-auto h-[432px] w-full max-w-3xl rounded-2xl bg-secondary-200 dark:bg-secondary-800" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-page py-24">
        <div className="surface mx-auto max-w-md p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
            <Sparkles size={22} />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-secondary-900 dark:text-white">
            Project not found
          </h2>
          <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
            This project doesn't exist, or it may have been removed.
          </p>
          <Button as={Link} to="/projects" className="mt-6" leftIcon={<ArrowLeft size={16} />}>
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* HERO -- same aurora + grid treatment as the other public page heroes,
          so the detail view reads as part of the site rather than a bare form. */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-aurora-light dark:bg-aurora"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-60"
        />

        <div className="container-page relative">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            All projects
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                {project.category && (
                  <span className="eyebrow">
                    <span className="eyebrow-dot" />
                    {project.category}
                  </span>
                )}
                {project.featured && <span className="chip-accent">Featured</span>}
              </div>

              <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tightest text-balance text-secondary-900 dark:text-white">
                {project.title}
              </h1>

              {project.short_description && (
                <p className="mt-4 max-w-2xl text-lg text-secondary-600 dark:text-secondary-300 text-pretty">
                  {project.short_description}
                </p>
              )}

              {/* The live URL shown as text, not just hidden behind a button --
                  a real address is evidence the thing actually ships. */}
              {liveLink && (
                <a
                  href={project.live_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex max-w-full items-center gap-1.5 font-mono text-sm text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 transition-colors"
                >
                  {liveLink.isStore ? <Smartphone size={14} /> : <Globe size={14} />}
                  <span className="truncate underline decoration-brand-500/30 underline-offset-4 group-hover:decoration-brand-500">
                    {liveLink.display}
                  </span>
                  <ArrowUpRight
                    size={13}
                    className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              )}

              {tech.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tech.map(t => (
                    <span key={t} className="chip-brand">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {(project.live_url || project.github_url) && (
              <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                {project.live_url && (
                  <Button
                    as="a"
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="gradient"
                    leftIcon={liveLink?.isStore ? <Smartphone size={16} /> : <ExternalLink size={16} />}
                  >
                    {liveLink?.label ?? 'Live demo'}
                  </Button>
                )}
                {project.github_url && (
                  <Button
                    as="a"
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    leftIcon={<Github size={16} />}
                  >
                    View code
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container-page">
        {/* GALLERY */}
        {gallery.length > 0 && (
          <section className="mb-16 space-y-4">
            {/* Contained, not cropped: project images are usually screenshots --
                often tall phone captures -- so object-cover magnified them to an
                unreadable fragment. The blurred copy behind fills the letterbox
                so the frame stays solid whatever the source aspect ratio. */}
            <div className="group relative mx-auto w-full max-w-3xl aspect-video overflow-hidden rounded-2xl border border-secondary-200 dark:border-secondary-800 bg-secondary-100 dark:bg-secondary-900 shadow-xl shadow-secondary-900/[0.06] dark:shadow-black/40">
              <div
                aria-hidden
                className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl opacity-40 dark:opacity-25"
                style={{ backgroundImage: `url(${gallery[activeImage] ?? gallery[0]})` }}
              />
              <img
                src={gallery[activeImage] ?? gallery[0]}
                alt={
                  gallery.length > 1
                    ? `${project.title} — image ${activeImage + 1} of ${gallery.length}`
                    : project.title
                }
                className="absolute inset-0 h-full w-full object-contain"
              />

              {gallery.length > 1 && (
                <>
                  <GalleryNav direction="prev" onClick={() => step(-1)} />
                  <GalleryNav direction="next" onClick={() => step(1)} />

                  <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-2xs font-mono text-white backdrop-blur">
                    {activeImage + 1} / {gallery.length}
                  </span>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <>
                <p className="text-center text-xs text-secondary-500 dark:text-secondary-400">
                  Use{' '}
                  <kbd className="rounded border border-secondary-300 dark:border-secondary-700 px-1.5 py-0.5 font-mono text-2xs">
                    ←
                  </kbd>{' '}
                  <kbd className="rounded border border-secondary-300 dark:border-secondary-700 px-1.5 py-0.5 font-mono text-2xs">
                    →
                  </kbd>{' '}
                  to browse
                </p>

                <ul className="flex flex-wrap justify-center gap-3">
                  {gallery.map((url, index) => (
                    <li key={url}>
                      <button
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show image ${index + 1} of ${gallery.length}`}
                        aria-current={index === activeImage}
                        className={
                          'block overflow-hidden rounded-lg border-2 transition-all ' +
                          (index === activeImage
                            ? 'border-brand-500 ring-2 ring-brand-500/20'
                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-secondary-300 dark:hover:border-secondary-600')
                        }
                      >
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          className="h-20 w-28 object-contain bg-secondary-100 dark:bg-secondary-900"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* BODY -- single column, width-matched to the gallery frame above so the
            two stack on one axis. The old sidebar's links duplicated the hero's
            Live/Code buttons, so nothing here is unreachable without it. */}
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6">
            {project.description && (
              <section className="surface p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  <Layers size={13} className="text-brand-500" />
                  Overview
                </div>
                <p className="whitespace-pre-line leading-relaxed text-secondary-700 dark:text-secondary-300">
                  {project.description}
                </p>
              </section>
            )}

            {tech.length > 0 && (
              <section className="surface p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  <Sparkles size={13} className="text-brand-500" />
                  Built with
                </div>
                <div className="flex flex-wrap gap-2">
                  {tech.map(t => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Closing CTA -- the page used to end on the sidebar; without it the
              body needs its own way onward. */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-secondary-200/70 dark:border-secondary-800/70 pt-8">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Want to know more about how this was built?
            </p>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/contact" variant="outline" size="sm" rightIcon={<ArrowUpRight size={14} />}>
                Ask me about it
              </Button>
              <Button as={Link} to="/projects" variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
                All projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryNav({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Previous image' : 'Next image'}
      // Visible by default on touch (no hover to reveal them), fading in on
      // pointer devices so they don't sit permanently over the artwork.
      className={
        'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full ' +
        'bg-black/50 text-white backdrop-blur transition-all hover:bg-black/70 ' +
        'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ' +
        'sm:opacity-0 sm:group-hover:opacity-100 ' +
        (isPrev ? 'left-3' : 'right-3')
      }
    >
      {isPrev ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
    </button>
  );
}
