/**
 * Text helpers for presenting database-authored copy.
 *
 * The profile bio is a single free-text field rendered in two places: the hero
 * (where it needs to be short and must not repeat the headline's greeting) and
 * the About section (where the full text belongs). These keep that shaping in
 * one place instead of asking the author to maintain two bios.
 */

/**
 * Removes a leading self-introduction such as "Hi, I'm Gaurav Naik — ".
 *
 * The hero headline already reads "Hello, I'm {name}.", so a bio that opens the
 * same way says the name twice in consecutive lines. Only a leading greeting is
 * stripped; a bio that starts with substance is returned untouched.
 */
export function stripSelfIntro(bio: string): string {
  const withoutGreeting = bio.replace(
    // "Hi," / "Hello!" / "Hey" + "I'm" or "I am" + a short name, then a dash or comma.
    /^\s*(?:hi|hello|hey)\b[,!]?\s*(?:i(?:'|’)?m|i am)\b[^,.–—-]{0,40}?\s*[,–—-]+\s*/i,
    ''
  );

  if (withoutGreeting === bio) return bio.trim();

  // Re-capitalise, since we usually cut just before a lowercase continuation.
  const trimmed = withoutGreeting.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Returns the first `count` sentences, for use where a full bio is too long.
 * Falls back to the whole string when it has fewer sentences than requested.
 */
export function leadSentences(text: string, count = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!sentences || sentences.length <= count) return text.trim();
  return sentences.slice(0, count).join('').trim();
}

/**
 * Splits an author-entered list that may use commas, middots, pipes, bullets or
 * slashes as separators. The admin forms ask for commas, but pasted content
 * routinely arrives middot-separated, which previously rendered as one long
 * unbroken chip.
 */
export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,·•|/\n]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

/**
 * Normalises an already-stored array whose entries may each still hold a
 * separator-joined string.
 */
export function normalizeList(values: string[] | null | undefined): string[] {
  if (!values?.length) return [];
  return values.flatMap(splitList);
}

/** Formats a 10-digit Indian mobile number as "70284 95252"; other input is returned as-is. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return value;
}
