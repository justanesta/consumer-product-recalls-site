import ClassificationBadge from '@/components/ClassificationBadge';
import SourceBadge from '@/components/SourceBadge';
import StatusBadge from '@/components/StatusBadge';
import type { RecallSummary } from '@/lib/api/recalls';
import { formatDate } from '@/lib/format';

export default function RecallsTable({ items }: { items: RecallSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Date
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Source
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Title
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Class.
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Firm
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.recall_event_id}
              className="border-b border-line last:border-0 hover:bg-surface"
            >
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted">
                {formatDate(r.published_at)}
              </td>
              <td className="px-3 py-2">
                <SourceBadge source={r.source} />
              </td>
              <td className="px-3 py-2">
                <a
                  href={`/recalls/${r.source}/${encodeURIComponent(r.source_recall_id)}`}
                  className="font-medium no-underline hover:underline"
                >
                  {r.title ?? r.source_recall_id}
                </a>
              </td>
              <td className="px-3 py-2">
                <ClassificationBadge source={r.source} classification={r.classification} />
              </td>
              <td
                className="max-w-[12rem] truncate px-3 py-2 text-muted"
                title={r.primary_firm_name ?? ''}
              >
                {r.primary_firm_name ?? '—'}
              </td>
              <td className="px-3 py-2">
                <StatusBadge isActive={r.is_active} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
