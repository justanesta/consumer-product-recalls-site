import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  listRecalls,
  searchRecalls,
  type RecallSearchQuery,
  type RecallSummary,
} from '@/lib/api/recalls';
import {
  EMPTY_FILTERS,
  filtersToQuery,
  filtersToSearchParams,
  isSearchMode,
  searchParamsToFilters,
  type RecallFilters,
} from '@/lib/recalls/filters';
import FiltersPanel from './FiltersPanel';
import RecallsTable from './RecallsTable';

const PAGE_SIZE = 25;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (count, error) => error instanceof ApiError && error.isRetryable && count < 4,
      retryDelay: (count, error) =>
        error instanceof ApiError && error.retryAfter
          ? error.retryAfter * 1000
          : Math.min(1000 * 2 ** count, 8000),
    },
  },
});

interface PageResult {
  items: RecallSummary[];
  nextCursor: string | null;
}

function Browser() {
  const [filters, setFilters] = useState<RecallFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<RecallFilters>(EMPTY_FILTERS);
  const [cursors, setCursors] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [ready, setReady] = useState(false);

  // Read the URL once after hydration (keeps SSR/first render = EMPTY, no mismatch).
  useEffect(() => {
    const fromUrl = searchParamsToFilters(new URLSearchParams(window.location.search));
    setFilters(fromUrl);
    setDraft(fromUrl);
    setReady(true);
  }, []);

  // Mirror applied filters into the URL (shareable; cursor stays ephemeral).
  useEffect(() => {
    if (!ready) return;
    const qs = filtersToSearchParams(filters).toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [filters, ready]);

  const commit = useCallback((next: RecallFilters) => {
    setFilters(next);
    setDraft(next);
    setCursors([undefined]);
    setPageIndex(0);
  }, []);

  const cursor = cursors[pageIndex];
  const query = useQuery({
    queryKey: ['recalls', filters, pageIndex, cursor],
    enabled: ready,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PageResult> => {
      const apiQuery = filtersToQuery(filters, { limit: PAGE_SIZE, cursor });
      try {
        const page = isSearchMode(filters)
          ? await searchRecalls(apiQuery as RecallSearchQuery)
          : await listRecalls(apiQuery);
        return { items: page.items, nextCursor: page.next_cursor ?? null };
      } catch (error) {
        if (error instanceof ApiError && error.isBadCursor) {
          setCursors([undefined]);
          setPageIndex(0);
        }
        throw error;
      }
    },
  });

  const goNext = () => {
    const next = query.data?.nextCursor;
    if (!next) return;
    setCursors((cs) => {
      const copy = cs.slice(0, pageIndex + 1);
      copy[pageIndex + 1] = next;
      return copy;
    });
    setPageIndex((i) => i + 1);
  };
  const goPrev = () => setPageIndex((i) => Math.max(0, i - 1));

  const chips = useMemo(() => {
    const list: Array<{ key: string; label: string; remove: () => void }> = [];
    if (filters.q)
      list.push({ key: 'q', label: `“${filters.q}”`, remove: () => commit({ ...filters, q: '' }) });
    for (const s of filters.source)
      list.push({
        key: `src-${s}`,
        label: s,
        remove: () =>
          commit({ ...filters, source: filters.source.filter((x) => x !== s), classification: [] }),
      });
    for (const c of filters.classification)
      list.push({
        key: `cls-${c}`,
        label: `class ${c}`,
        remove: () =>
          commit({ ...filters, classification: filters.classification.filter((x) => x !== c) }),
      });
    if (filters.status !== 'any')
      list.push({
        key: 'status',
        label: filters.status,
        remove: () => commit({ ...filters, status: 'any' }),
      });
    for (const sc of filters.distribution_scope)
      list.push({
        key: `scope-${sc}`,
        label: sc,
        remove: () =>
          commit({
            ...filters,
            distribution_scope: filters.distribution_scope.filter((x) => x !== sc),
          }),
      });
    if (filters.published_after)
      list.push({
        key: 'after',
        label: `after ${filters.published_after}`,
        remove: () => commit({ ...filters, published_after: '' }),
      });
    if (filters.published_before)
      list.push({
        key: 'before',
        label: `before ${filters.published_before}`,
        remove: () => commit({ ...filters, published_before: '' }),
      });
    if (filters.firm)
      list.push({
        key: 'firm',
        label: `firm: ${filters.firm}`,
        remove: () => commit({ ...filters, firm: '' }),
      });
    return list;
  }, [filters, commit]);

  const items = query.data?.items ?? [];
  const apiError = query.error instanceof ApiError ? query.error : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="min-w-0">
        <FiltersPanel
          value={draft}
          onChange={setDraft}
          onApply={() => commit(draft)}
          onClear={() => commit(EMPTY_FILTERS)}
        />
      </aside>

      <div className="min-w-0">
        {chips.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-xs hover:bg-paper"
              >
                {chip.label}
                <span aria-hidden="true">×</span>
                <span className="sr-only">remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => commit(EMPTY_FILTERS)}
              className="text-xs text-muted underline"
            >
              clear all
            </button>
          </div>
        )}

        <div
          className="mb-2 flex items-center justify-between text-sm text-muted"
          aria-live="polite"
        >
          <span>
            {!ready || query.isPending
              ? 'Loading recalls…'
              : `${items.length} result${items.length === 1 ? '' : 's'} · page ${pageIndex + 1}`}
            {query.isFetching && ready && !query.isPending ? ' · updating…' : ''}
          </span>
        </div>

        {apiError ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
            <p className="font-medium text-ink">
              {apiError.isColdStart
                ? 'The API is waking up.'
                : apiError.isRateLimited
                  ? 'Too many requests. Please slow down a moment.'
                  : 'Could not load recalls.'}
            </p>
            <p className="mt-1 text-muted">
              {apiError.message}
              {apiError.requestId ? ` (ref ${apiError.requestId})` : ''}
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-2 rounded border border-line px-3 py-1 text-sm"
            >
              Retry
            </button>
          </div>
        ) : ready && !query.isPending && items.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-muted">
            <p>No recalls match these filters.</p>
            <p className="mt-1">A “no match” here only covers our five sources.</p>
          </div>
        ) : (
          <RecallsTable items={items} />
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={pageIndex === 0 || query.isFetching}
            className="rounded-md border border-line px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-muted">Page {pageIndex + 1}</span>
          <button
            type="button"
            onClick={goNext}
            disabled={!query.data?.nextCursor || query.isFetching}
            className="rounded-md border border-line px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecallsBrowser() {
  return (
    <QueryClientProvider client={queryClient}>
      <Browser />
    </QueryClientProvider>
  );
}
