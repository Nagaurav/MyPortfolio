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
  Maximize2,
  Sparkles,
  X,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { cn } from '../../lib/utils';
import { leadSentences, normalizeList, splitLines } from '../../lib/text';
import { SHIPPING_META, toShippingStatus } from '../../lib/shipping-status';
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
  const shipping = toShippingStatus(project?.shipping_status);
  const ShippingIcon = shipping ? SHIPPING_META[shipping].icon : null;

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
      {/* HERO -- copy left, device right, the way the reference case studies
          open. The badge states category and status in one line so the headline
          does not have to carry it. */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-aurora-light dark:bg-aurora"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid dark:bg-grid-dark bg-grid mask-fade-bottom opacity-60"
        />

        <div className="container-page relative">
          {/* Breadcrumb rather than a lone back link: it says where this page
              sits, not just where the last one was. */}
          <nav aria-label="Breadcrumb" className="text-sm text-secondary-500 dark:text-secondary-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-secondary-400 dark:text-secondary-600">/</li>
              <li>
                <Link to="/projects" className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                  Projects
                </Link>
              </li>
              <li aria-hidden className="text-secondary-400 dark:text-secondary-600">/</li>
              <li className="font-medium text-secondary-700 dark:text-secondary-200">
                {project.title}
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12"
          >
            <div className="lg:col-span-7">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {[
                  shipping && SHIPPING_META[shipping].label,
                  liveLink?.isStore ? 'Live on Google Play' : liveLink && 'Live',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance text-secondary-900 dark:text-white">
                {project.title}
              </h1>

              {/* The template has one "what it does" field, so the standfirst is
                  its opening sentences rather than a second copy to keep in sync. */}
              {project.description && (
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-secondary-600 dark:text-secondary-300 text-pretty">
                  {leadSentences(project.description, 2)}
                </p>
              )}

              {/* How far it actually got -- the first thing a reader wants to
                  know about anything that sounds impressive. */}
              {(shipping || project.shipping_note) && (
                <div className="mt-6 rounded-r-lg border-l-2 border-brand-500 bg-brand-500/5 px-4 py-3">
                  {shipping && ShippingIcon && (
                    <span
                      className={cn(
                        'mr-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold align-middle',
                        SHIPPING_META[shipping].badgeClass
                      )}
                    >
                      <ShippingIcon size={12} />
                      {SHIPPING_META[shipping].label}
                    </span>
                  )}
                  {project.shipping_note && (
                    <span className="text-sm leading-relaxed text-secondary-700 dark:text-secondary-300">
                      {project.shipping_note}
                    </span>
                  )}
                </div>
              )}

              {(project.live_url || project.github_url) && (
                <div className="mt-7 flex flex-wrap gap-3">
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

              {/* Fact pills instead of the old sidebar panel: three short facts
                  read faster inline than as a table competing with the copy. */}
              <div className="mt-7 flex flex-wrap gap-2">
                {project.audience && (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-secondary-200 dark:border-secondary-700 px-3 py-1.5 text-xs font-medium text-secondary-600 dark:text-secondary-300">
                    <Users size={12} className="shrink-0" />
                    <span className="truncate">{project.audience}</span>
                  </span>
                )}
                {tech.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 dark:border-secondary-700 px-3 py-1.5 text-xs font-medium text-secondary-600 dark:text-secondary-300">
                    <Sparkles size={12} />
                    {tech.length} technologies
                  </span>
                )}
                {liveLink && (
                  <a
                    href={project.live_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[60%] items-center gap-1.5 rounded-full border border-secondary-200 dark:border-secondary-700 px-3 py-1.5 font-mono text-xs text-brand-600 dark:text-brand-300 transition-colors hover:border-brand-500/50"
                  >
                    {liveLink.isStore ? <Smartphone size={12} /> : <Globe size={12} />}
                    <span className="truncate">{liveLink.display}</span>
                  </a>
                )}
              </div>
            </div>

            {/* The frame follows the image's own orientation, measured on load:
                a phone capture in a 16:9 box was a narrow strip of content
                surrounded by blurred filler. */}
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

      {/* THE PROJECT -- centred section header then prose, the rhythm the
          reference case studies repeat down the page. */}
      {project.description && (
        <section className="border-t border-secondary-200/70 dark:border-secondary-800/70 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader
              eyebrow="The project"
              title="What it"
              highlight="is"
              centered
              variant="tech"
            />
            <p className="mx-auto max-w-3xl whitespace-pre-line text-center leading-relaxed text-secondary-700 dark:text-secondary-300">
              {project.description}
            </p>
          </div>
        </section>
      )}

      {/* THE WORK -- contributions as a card grid rather than a list. Each one
          is a discrete piece of work, so each gets its own card. */}
      {contributions.length > 0 && (
        <section className="border-t border-secondary-200/70 dark:border-secondary-800/70 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader
              eyebrow="The work"
              title="What I"
              highlight="built"
              subtitle={`${contributions.length} pieces of this are mine, end to end.`}
              centered
              variant="tech"
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {contributions.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                  className="surface p-6"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-sm font-bold text-brand-600 dark:text-brand-300 ring-1 ring-inset ring-brand-500/20">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-secondary-700 dark:text-secondary-300">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THE PROBLEM -- one long-form answer, so it reads as a single column of
          prose rather than being chopped into cards like the contributions. */}
      {project.hardest_problem && (
        <section className="border-t border-secondary-200/70 dark:border-secondary-800/70 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader
              eyebrow="The problem"
              title="The hardest"
              highlight="part"
              subtitle="What broke, and what I did about it."
              centered
              variant="tech"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-3xl whitespace-pre-line leading-relaxed text-secondary-700 dark:text-secondary-300"
            >
              {project.hardest_problem}
            </motion.p>
          </div>
        </section>
      )}

      {/* SCREENS */}
      {gallery.length > 1 && (
        <section className="border-t border-secondary-200/70 dark:border-secondary-800/70 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader
              eyebrow="Screens"
              title="What it looks"
              highlight="like"
              subtitle="Tap any screen to open it full size."
              centered
              variant="tech"
            />

            <ul className="flex flex-wrap justify-center gap-4">
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
                      'block cursor-zoom-in overflow-hidden rounded-xl border-2 transition-all hover:-translate-y-0.5',
                      index === activeImage
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-secondary-200/70 dark:border-secondary-800/70 hover:border-secondary-300 dark:hover:border-secondary-600'
                    )}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className={cn(
                        'object-contain bg-secondary-100 dark:bg-secondary-900',
                        portrait ? 'h-64 w-36' : 'h-40 w-64'
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* BUILT WITH */}
      {tech.length > 0 && (
        <section className="border-t border-secondary-200/70 dark:border-secondary-800/70 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader
              eyebrow="Stack"
              title="Built"
              highlight="with"
              centered
              variant="tech"
            />
            <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
              {tech.map(t => (
                <span key={t} className="chip-brand">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <div className="container-page">
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-secondary-200/70 dark:border-secondary-800/70 pt-8">
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
