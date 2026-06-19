import type { DistributionScope, RecallListQuery, Source } from '@/lib/api/recalls';

export type StatusFilter = 'active' | 'inactive' | 'any';

export interface RecallFilters {
  /** Keyword search — when set, the browser uses /recalls/search. */
  q: string;
  source: Source[];
  classification: string[];
  status: StatusFilter;
  distribution_scope: DistributionScope[];
  published_after: string;
  published_before: string;
  firm: string;
}

export const EMPTY_FILTERS: RecallFilters = {
  q: '',
  source: [],
  classification: [],
  status: 'any',
  distribution_scope: [],
  published_after: '',
  published_before: '',
  firm: '',
};

const SOURCE_VALUES: readonly string[] = ['CPSC', 'FDA', 'USDA', 'NHTSA', 'USCG'];
const SCOPE_VALUES: readonly string[] = ['Nationwide', 'Regional', 'Unspecified', 'International'];

const splitCsv = (value: string | null): string[] =>
  value
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

/** Serialize filters to a shareable querystring (the URL is the source of truth). */
export function filtersToSearchParams(f: RecallFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  if (f.source.length) p.set('source', f.source.join(','));
  if (f.classification.length) p.set('classification', f.classification.join(','));
  if (f.status !== 'any') p.set('status', f.status);
  if (f.distribution_scope.length) p.set('scope', f.distribution_scope.join(','));
  if (f.published_after) p.set('after', f.published_after);
  if (f.published_before) p.set('before', f.published_before);
  if (f.firm.trim()) p.set('firm', f.firm.trim());
  return p;
}

/** Parse filters back out of a querystring (ignores unknown enum values). */
export function searchParamsToFilters(p: URLSearchParams): RecallFilters {
  const statusRaw = p.get('status');
  return {
    q: p.get('q') ?? '',
    source: splitCsv(p.get('source')).filter((s): s is Source => SOURCE_VALUES.includes(s)),
    classification: splitCsv(p.get('classification')),
    status: statusRaw === 'active' || statusRaw === 'inactive' ? statusRaw : 'any',
    distribution_scope: splitCsv(p.get('scope')).filter((s): s is DistributionScope =>
      SCOPE_VALUES.includes(s),
    ),
    published_after: p.get('after') ?? '',
    published_before: p.get('before') ?? '',
    firm: p.get('firm') ?? '',
  };
}

/** Map filters to the API query (adds limit/cursor; `q` triggers the search endpoint). */
export function filtersToQuery(
  f: RecallFilters,
  opts: { limit: number; cursor?: string },
): RecallListQuery & { q?: string } {
  const query: RecallListQuery & { q?: string } = { limit: opts.limit };
  if (opts.cursor) query.cursor = opts.cursor;
  if (f.q.trim()) query.q = f.q.trim();
  if (f.source.length) query.source = f.source;
  if (f.classification.length) query.classification = f.classification;
  if (f.status === 'active') query.is_active = true;
  else if (f.status === 'inactive') query.is_active = false;
  if (f.distribution_scope.length) query.distribution_scope = f.distribution_scope;
  if (f.published_after) query.published_after = f.published_after;
  if (f.published_before) query.published_before = f.published_before;
  if (f.firm.trim()) query.firm = f.firm.trim();
  return query;
}

export function hasActiveFilters(f: RecallFilters): boolean {
  return JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);
}

/** Whether the keyword-search endpoint should be used for these filters. */
export function isSearchMode(f: RecallFilters): boolean {
  return f.q.trim().length > 0;
}
