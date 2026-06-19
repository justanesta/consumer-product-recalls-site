import { useEffect, useState } from 'react';
import { ApiError, withRetry } from '@/lib/api/client';
import { getRecall, type RecallDetail as RecallDetailType } from '@/lib/api/recalls';
import RecallDetail from './RecallDetail';

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: RecallDetailType }
  | { status: 'notfound' }
  | { status: 'error'; message: string };

/** Long-tail recall viewer: derives source + id from the URL and fetches client-side. */
export default function RecallDetailViewer() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'recalls' || parts.length < 3) {
      setState({ status: 'notfound' });
      return;
    }
    const source = parts[1] ?? '';
    const id = decodeURIComponent(parts.slice(2).join('/'));

    let alive = true;
    withRetry(() => getRecall(source, id))
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch((error) => {
        if (!alive) return;
        if (error instanceof ApiError && error.isNotFound) setState({ status: 'notfound' });
        else
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to load',
          });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <p className="text-muted">Loading recall…</p>;
  }
  if (state.status === 'notfound') {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm">
        <p className="font-medium text-ink">Recall not found.</p>
        <p className="mt-1 text-muted">
          We couldn't find that recall. <a href="/recalls">Browse all recalls</a> or{' '}
          <a href="/search">search</a>.
        </p>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
        <p className="font-medium text-ink">Could not load this recall.</p>
        <p className="mt-1 text-muted">{state.message}</p>
      </div>
    );
  }
  return <RecallDetail detail={state.data} />;
}
