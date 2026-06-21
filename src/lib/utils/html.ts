/**
 * Render a source narrative as clean plain text.
 *
 * Some feeds (notably USDA) store `recall_reason` / `corrective_action` as HTML
 * markup; others (CPSC) store plain text. We don't want raw `<p>`/`<a>` tags
 * leaking into the page, and rendering source HTML directly is an injection risk,
 * so we strip tags here: block-level tags become paragraph breaks, inline tags are
 * dropped, and the common HTML entities are decoded. Plain-text input passes
 * through essentially unchanged (just entity-decoded and whitespace-normalized).
 */
export function htmlToText(input?: string | null): string {
  if (!input) return '';
  let s = input;
  // Block-level boundaries become newlines so paragraphs survive.
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|ul|ol|blockquote)>/gi, '\n');
  s = s.replace(/<(br|hr)\s*\/?>/gi, '\n');
  // Drop every remaining tag.
  s = s.replace(/<[^>]+>/g, '');
  // Decode the handful of entities that actually show up in recall prose.
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&rsquo;/gi, '’')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');
  // Normalize whitespace; keep paragraph breaks, collapse runs.
  s = s
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}
