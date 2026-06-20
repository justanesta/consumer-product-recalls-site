import FirmProfileViewer from '@/components/firms/FirmProfileViewer';
import RecallDetailViewer from '@/components/recalls/RecallDetailViewer';

const RECALL_PATH = /^\/recalls\/[^/]+\/.+/;
const FIRM_PATH = /^\/firms\/[0-9a-f]{32}\/?$/;

/**
 * Universal long-tail fallback mounted on the 404 page: if the unmatched URL is a
 * recall or firm route, render the matching client-fetch viewer; otherwise render
 * nothing and let the static 404 content stand.
 *
 * In production Cloudflare's `_redirects` rewrites the long tail to the dedicated
 * /recall-view & /firm-view shells (clean 200s) before this ever runs. This island
 * is the host-agnostic safety net so the same URLs also resolve under plain
 * `astro preview` / `astro dev` and any non-Cloudflare static host.
 */
export default function LongTailViewer() {
  const path = typeof window === 'undefined' ? '' : window.location.pathname;
  if (RECALL_PATH.test(path)) return <RecallDetailViewer />;
  if (FIRM_PATH.test(path)) return <FirmProfileViewer />;
  return null;
}
