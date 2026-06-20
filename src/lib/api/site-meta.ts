import { withRetry } from './client';
import { getStatsOverview } from './stats';

export interface SiteMeta {
  /** When the upstream data was last rebuilt (ISO), or null if unavailable at build time. */
  lastRebuiltAt: string | null;
}

let cached: Promise<SiteMeta> | null = null;

/**
 * Build-time site metadata, memoized for the whole build, that feeds the global
 * footer's "Data updated" stamp on every page.
 *
 * Tolerant by design: a failure yields a null stamp rather than failing the many
 * pages (about, methodology, 404, …) that otherwise never touch the API. The real
 * data pages (index, dashboards) keep their own loud build-time fetches, so an
 * unreachable API still fails the build there — we never ship blank data.
 */
export function getSiteMeta(): Promise<SiteMeta> {
  if (!cached) {
    cached = withRetry(() => getStatsOverview())
      .then((overview) => ({ lastRebuiltAt: overview.last_rebuilt_at ?? null }))
      .catch(() => ({ lastRebuiltAt: null }));
  }
  return cached;
}
