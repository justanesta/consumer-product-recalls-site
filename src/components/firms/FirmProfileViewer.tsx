import { useEffect, useState } from 'react';
import { ApiError, withRetry } from '@/lib/api/client';
import { getFirm, type FirmProfile as FirmProfileType } from '@/lib/api/firms';
import FirmProfile from './FirmProfile';
import FirmRecalls from './FirmRecalls';

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: FirmProfileType }
  | { status: 'notfound' }
  | { status: 'error'; message: string };

/** Long-tail firm viewer: derives firm_id from the URL and fetches client-side. */
export default function FirmProfileViewer() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const firmId = parts[0] === 'firms' ? (parts[1] ?? '') : '';
    if (!/^[0-9a-f]{32}$/.test(firmId)) {
      setState({ status: 'notfound' });
      return;
    }

    let alive = true;
    withRetry(() => getFirm(firmId))
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch((error) => {
        if (!alive) return;
        if (error instanceof ApiError && error.isNotFound) setState({ status: 'notfound' });
        else
          setState({ status: 'error', message: error instanceof Error ? error.message : 'Failed' });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === 'loading') return <p className="text-muted">Loading firm…</p>;
  if (state.status === 'notfound') {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm">
        <p className="font-medium text-ink">Firm not found.</p>
        <p className="mt-1 text-muted">
          <a href="/recalls">Browse recalls</a> to find a firm.
        </p>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
        <p className="font-medium text-ink">Could not load this firm.</p>
        <p className="mt-1 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <div>
      <FirmProfile profile={state.data} />
      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold">This firm's recalls</h2>
        <div className="mt-2">
          <FirmRecalls firmId={state.data.firm_id} />
        </div>
      </section>
    </div>
  );
}
