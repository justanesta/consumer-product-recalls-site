import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import SourceBadge from '@/components/SourceBadge';
import { ApiError } from '@/lib/api/client';
import { searchProducts, type ProductSearchHit, type ProductSearchQuery } from '@/lib/api/products';
import { formatDate } from '@/lib/format';

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

const INPUT = 'w-full rounded border border-line bg-paper px-3 py-2 text-sm';

function ResultRow({ hit }: { hit: ProductSearchHit }) {
  return (
    <li className="border-b border-line py-3 last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted">
        <SourceBadge source={hit.source} />
        <span>{formatDate(hit.published_at)}</span>
      </div>
      <a
        href={`/recalls/${hit.source}/${encodeURIComponent(hit.source_recall_id)}`}
        className="mt-1 block font-medium no-underline hover:underline"
      >
        {hit.product_name ?? hit.recall_title ?? hit.source_recall_id}
      </a>
      {hit.recall_title && hit.recall_title !== hit.product_name && (
        <p className="text-sm text-muted">{hit.recall_title}</p>
      )}
      {(hit.model || hit.hin) && (
        <p className="mt-0.5 text-xs text-muted">
          {hit.model ? `Model: ${hit.model}. ` : ''}
          {hit.hin ? `HIN: ${hit.hin}.` : ''}
        </p>
      )}
    </li>
  );
}

function Search() {
  const [q, setQ] = useState('');
  const [upc, setUpc] = useState('');
  const [hin, setHin] = useState('');
  const [model, setModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitted, setSubmitted] = useState<ProductSearchQuery | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQ = params.get('q') ?? '';
    const urlUpc = params.get('upc') ?? '';
    const urlHin = params.get('hin') ?? '';
    const urlModel = params.get('model') ?? '';
    if (urlQ) setQ(urlQ);
    if (urlUpc) setUpc(urlUpc);
    if (urlHin) setHin(urlHin);
    if (urlModel) setModel(urlModel);
    // Open the identifier panel if the link landed on one of its fields.
    if (urlUpc || urlHin || urlModel) setShowAdvanced(true);
    const initial: ProductSearchQuery = {};
    if (urlQ) initial.q = urlQ;
    if (urlUpc) initial.upc = urlUpc;
    if (urlHin) initial.hin = urlHin;
    if (urlModel) initial.model = urlModel;
    if (Object.keys(initial).length > 0) setSubmitted(initial);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query: ProductSearchQuery = {};
    if (q.trim()) query.q = q.trim();
    if (upc.trim()) query.upc = upc.trim();
    if (hin.trim()) query.hin = hin.trim();
    if (model.trim()) query.model = model.trim();
    if (!query.q && !query.upc && !query.hin && !query.model) {
      setSubmitted(null);
      return;
    }
    setSubmitted(query);
    const usp = new URLSearchParams();
    if (query.q) usp.set('q', query.q);
    if (query.upc) usp.set('upc', query.upc);
    if (query.hin) usp.set('hin', query.hin);
    if (query.model) usp.set('model', query.model);
    window.history.replaceState(null, '', usp.toString() ? `?${usp}` : window.location.pathname);
  };

  const query = useQuery({
    queryKey: ['products', submitted],
    enabled: submitted !== null,
    queryFn: () => searchProducts(submitted as ProductSearchQuery),
  });

  const items = query.data?.items ?? [];
  const apiError = query.error instanceof ApiError ? query.error : null;

  return (
    <div className="max-w-2xl">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="s-q" className="block text-sm font-medium">
            Search products &amp; recalls
          </label>
          <input
            id="s-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. infant rocker, ground beef, lithium battery"
            className={`mt-1 ${INPUT}`}
            autoComplete="off"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-brand underline"
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? 'Hide' : 'Search by exact identifier (UPC / model / HIN)'}
          </button>
          {showAdvanced && (
            <div className="mt-2 space-y-3">
              <div>
                <label htmlFor="s-upc" className="block text-xs text-muted">
                  UPC (product barcode; recall-level, mostly CPSC)
                </label>
                <input
                  id="s-upc"
                  inputMode="numeric"
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  placeholder="e.g. 081234567890"
                  className={INPUT}
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="s-model" className="block text-xs text-muted">
                    Model (NHTSA)
                  </label>
                  <input
                    id="s-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="s-hin" className="block text-xs text-muted">
                    HIN (USCG boats)
                  </label>
                  <input
                    id="s-hin"
                    value={hin}
                    onChange={(e) => setHin(e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      <p className="mt-3 text-xs text-muted">
        Keyword search is exact (not fuzzy) across data from all five sources. UPC lookup is
        recall-level. For vehicles and boats use the model/HIN fields.
      </p>

      <div className="mt-6" aria-live="polite">
        {submitted === null ? null : query.isPending ? (
          <p className="text-sm text-muted">Searching…</p>
        ) : apiError ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
            <p className="font-medium text-ink">
              {apiError.isColdStart ? 'The API is waking up.' : 'Search failed.'}
            </p>
            <p className="mt-1 text-muted">{apiError.message}</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-2 rounded border border-line px-3 py-1 text-sm"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface p-6 text-sm">
            <p className="font-medium text-ink">No matches found.</p>
            <p className="mt-1 text-muted">
              A “no match” only covers our five sources (CPSC, FDA, USDA, NHTSA, USCG) — it does
              <strong> not</strong> mean a product is safe. Try fewer or different keywords, and see
              the <a href="/methodology">methodology</a>.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted">
              {items.length} result{items.length === 1 ? '' : 's'}
            </p>
            <ul className="rounded-lg border border-line px-4">
              {items.map((hit) => (
                <ResultRow key={hit.recall_product_id} hit={hit} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductSearch() {
  return (
    <QueryClientProvider client={queryClient}>
      <Search />
    </QueryClientProvider>
  );
}
