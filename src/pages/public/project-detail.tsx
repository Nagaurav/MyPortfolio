import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  Globe,
  Smartphone,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Sparkles,
  X,
  UserRound,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { linkHost, normalizeList, splitLines } from '../../lib/text';
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
  const [portrait, setPortrait] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Prefer the gallery; fall back to the single cover for rows predating it.
  const gallery = project?.image_urls?.length
    ? project.image_urls
    : project?.image_url
      ? [project.image_url]
      : [];

  const tech = normalizeList(project?.tech_stack);
  // Older rows may hold one joined blob per entry, so re-split on newlines.
  const contributions = (project?.contributions ?? []).flatMap(splitLines);
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

  // While the lightbox is open: Escape closes it, the page behind must not
  // scroll, and focus moves to the close button so it is keyboard-operable.
  // The arrow-key handler above keeps working, so browsing needs no new wiring.
  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

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
      {/* HERO -- copy left, the active image right. The copy measure ran out
          around 60% of the width, so the image fills the band that was empty
          and the reader sees the product next to the sentence describing it. */}
      <section className="relative overflow-hidden pt-10 pb-10 sm:pt-14">
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
            className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12"
          >
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                {project.category && (
                  <span className="eyebrow">
                    <span className="eyebrow-dot" />
                    {project.category}
                  </span>
                )}
                {project.featured && <span className="chip-accent">Featured</span>}
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-balance text-secondary-900 dark:text-white">
                {project.title}
              </h1>

              {project.short_description && (
                <p className="mt-4 text-base leading-relaxed text-secondary-600 dark:text-secondary-300 text-pretty">
                  {project.short_description}
                </p>
              )}

              {(project.live_url || project.github_url) && (
                <div className="mt-6 flex flex-wrap gap-3">
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
            </div>

            {/* The frame follows the image's own orientation, measured on load.
                A phone screenshot in a 16:9 box was a narrow strip of content
                surrounded by blurred filler; portrait sources get a phone-shaped
                frame instead, capped so a tall image cannot run off the screen. */}
            {gallery.length > 0 && (
              <div className="lg:col-span-5">
                <div
                  className={cn(
                    'group relative mx-auto w-full overflow-hidden rounded-2xl border border-secondary-200 dark:border-secondary-800',
                    'bg-secondary-100 dark:bg-secondary-900 shadow-xl shadow-secondary-900/[0.06] dark:shadow-black/40',
                    portrait ? 'aspect-[9/16] max-w-[300px]' : 'aspect-[16/10] max-w-xl'
                  )}
                >
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
                    onLoad={event => {
                      const img = event.currentTarget;
                      setPortrait(img.naturalHeight > img.naturalWidth);
                    }}
                    className="absolute inset-0 h-full w-full object-contain"
                  />

                  {/* Click or tap anywhere on the image to enlarge it. Declared
                      before the nav arrows so they paint above it and keep
                      taking their own clicks. */}
                  <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    aria-label="View larger"
                    className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                  >
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-2xs font-medium text-white backdrop-blur transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <Maximize2 size={11} />
                      View larger
                    </span>
                  </button>

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
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container-page">
        {/* EVERY IMAGE -- a grid rather than a single strip, so a five-screen
            app shows all five at a readable size. Clicking one swaps the hero
            image above, which is why this sits directly under it. */}
        {gallery.length > 1 && (
          <section className="mb-14">
            <h2 className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              <ImageIcon size={13} className="text-brand-500" />
              Screens
              <span className="text-secondary-400 dark:text-secondary-600">({gallery.length})</span>
            </h2>

            <ul className="mt-4 flex flex-wrap gap-3">
              {gallery.map((url, index) => (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImage(index);
                      setLightbox(true);
                    }}
                    aria-label={`View image ${index + 1} of ${gallery.length} larger`}
                    aria-current={index === activeImage}
                    className={cn(
                      'block cursor-zoom-in overflow-hidden rounded-xl border-2 transition-all',
                      index === activeImage
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-secondary-200/70 dark:border-secondary-800/70 opacity-70 hover:opacity-100 hover:border-secondary-300 dark:hover:border-secondary-600'
                    )}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className={cn(
                        'object-contain bg-secondary-100 dark:bg-secondary-900',
                        portrait ? 'h-44 w-[99px]' : 'h-28 w-44'
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* BODY -- prose left, spec sheet right. The four equal-weight cards
            this replaces gave a one-line role as much of the page as the whole
            overview. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 space-y-10">
            {project.description && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  <Layers size={13} className="text-brand-500" />
                  Overview
                </h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-secondary-700 dark:text-secondary-300">
                  {project.description}
                </p>
              </section>
            )}

            {contributions.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  <Check size={13} className="text-brand-500" />
                  What I built
                </h2>
                {/* Numbered rather than bulleted: these are the specific pieces
                    of work, and the count is itself informative. */}
                <ol className="mt-4 space-y-3">
                  {contributions.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-500/10 text-2xs font-bold text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-secondary-700 dark:text-secondary-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* Sticky on desktop so role and stack stay in view while the overview
              scrolls. Rows only render when the field is set, so a sparse
              project shows a short card rather than a tall empty one. */}
          <aside className="lg:col-span-5">
            <div className="surface-strong p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                At a glance
              </div>

              <dl className="mt-3 divide-y divide-secondary-200/70 dark:divide-secondary-800/70">
                {project.role && (
                  <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
                    <dt className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                      <UserRound size={13} />
                      My role
                    </dt>
                    <dd className="text-right text-sm font-semibold text-secondary-900 dark:text-white">
                      {project.role}
                    </dd>
                  </div>
                )}

                {project.category && (
                  <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
                    <dt className="text-sm text-secondary-500 dark:text-secondary-400">Category</dt>
                    <dd className="text-right text-sm font-semibold text-secondary-900 dark:text-white">
                      {project.category}
                    </dd>
                  </div>
                )}

                {/* The address as text, not another button: a real URL is
                    evidence the thing actually ships. */}
                {liveLink && (
                  <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
                    <dt className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                      {liveLink.isStore ? <Smartphone size={13} /> : <Globe size={13} />}
                      {liveLink.isStore ? 'Store' : 'Live at'}
                    </dt>
                    <dd className="min-w-0 text-right">
                      <a
                        href={project.live_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex max-w-full items-center gap-1 font-mono text-xs text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
                      >
                        <span className="truncate underline decoration-brand-500/30 underline-offset-4 group-hover:decoration-brand-500">
                          {liveLink.display}
                        </span>
                        <ArrowUpRight size={12} className="shrink-0" />
                      </a>
                    </dd>
                  </div>
                )}

                {project.github_url && (
                  <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
                    <dt className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                      <Github size={13} />
                      Source
                    </dt>
                    <dd className="min-w-0 text-right">
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex max-w-full items-center gap-1 font-mono text-xs text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200"
                      >
                        <span className="truncate underline decoration-brand-500/30 underline-offset-4 group-hover:decoration-brand-500">
                          {linkHost(project.github_url)}
                        </span>
                        <ArrowUpRight size={12} className="shrink-0" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {tech.length > 0 && (
                <div className="mt-4 border-t border-secondary-200/70 dark:border-secondary-800/70 pt-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                    <Sparkles size={13} className="text-brand-500" />
                    Tech stack
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tech.map(t => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Closing CTA -- the reader needs a way onward once the overview ends. */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-secondary-200/70 dark:border-secondary-800/70 pt-8">
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
      {/* LIGHTBOX -- tapping any image opens it at full size. The detail in a
          screenshot (a bill layout, a settings screen) is unreadable at phone-
          frame or thumbnail size, so the images have to be openable. */}
      <AnimatePresence>
        {lightbox && gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} — image ${activeImage + 1} of ${gallery.length}`}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
          >
            {/* The backdrop closes on click, so the image must swallow its own. */}
            <motion.img
              key={gallery[activeImage] ?? gallery[0]}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={gallery[activeImage] ?? gallery[0]}
              alt={`${project.title} — image ${activeImage + 1} of ${gallery.length}`}
              onClick={event => event.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />

            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close image"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X size={18} />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
                >
                  <ArrowRight size={20} />
                </button>

                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white backdrop-blur">
                  {activeImage + 1} / {gallery.length}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
