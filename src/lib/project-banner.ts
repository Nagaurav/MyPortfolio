import banners from '../data/project-banners.json';

/**
 * Cover image for a project card.
 *
 * Prefers the generated banner (see scripts/generate-project-banners.mjs) and
 * falls back to the raw screenshot, so a project added since the last
 * `npm run banners` still renders rather than showing an empty frame.
 */
export function projectBanner(
  id: string,
  fallback?: string | null
): { src: string | null; designed: boolean } {
  const banner = (banners as Record<string, string>)[id];
  if (banner) return { src: banner, designed: true };
  return { src: fallback ?? null, designed: false };
}
