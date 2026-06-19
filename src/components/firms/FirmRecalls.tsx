import { useEffect, useState } from 'react';
import { withRetry } from '@/lib/api/client';
import { listRecalls, type RecallSummary } from '@/lib/api/recalls';
import RecallsTable from '@/components/recalls/RecallsTable';

type State =
  | { status: 'loading' }
  | { status: 'ok'; items: RecallSummary[] }
  | { status: 'error'; message: string };

/** This firm's recalls, fetched live by firm_id (matches the firm in any role). */
export default function FirmRecalls({ firmId }: { firmId: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    withRetry(() => listRecalls({ firm_id: firmId, limit: 25 }))
      .then((page) => alive && setState({ status: 'ok', items: page.items }))
      .catch(
        (error) =>
          alive &&
          setState({ status: 'error', message: error instanceof Error ? error.message : 'Failed' }),
      );
    return () => {
      alive = false;
    };
  }, [firmId]);

  if (state.status === 'loading') return <p className="text-sm text-muted">Loading recalls…</p>;
  if (state.status === 'error')
    return (
      <p className="text-sm text-muted">Could not load this firm's recalls ({state.message}).</p>
    );
  if (state.items.length === 0) return <p className="text-sm text-muted">No recalls found.</p>;

  return (
    <div>
      <RecallsTable items={state.items} />
      {state.items.length === 25 && (
        <p className="mt-2 text-xs text-muted">Showing the 25 most recent.</p>
      )}
    </div>
  );
}
