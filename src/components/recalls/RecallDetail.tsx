import type { ReactNode } from 'react';
import ClassificationBadge from '@/components/ClassificationBadge';
import SourceBadge from '@/components/SourceBadge';
import StatusBadge from '@/components/StatusBadge';
import type { RecallDetail as RecallDetailType } from '@/lib/api/recalls';
import { formatDate } from '@/lib/format';
import { htmlToText } from '@/lib/utils/html';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** Pull the free-text hazard sentence out of CPSC's structured hazard jsonb objects. */
function hazardNames(hazards: unknown[] | null | undefined): string[] {
  return (hazards ?? [])
    .map((h) => {
      if (!h || typeof h !== 'object') return null;
      const value =
        (h as { name?: unknown; Name?: unknown }).name ?? (h as { Name?: unknown }).Name;
      return typeof value === 'string' ? value.trim() : null;
    })
    .filter((n): n is string => !!n && n.length > 0);
}

export default function RecallDetail({ detail }: { detail: RecallDetailType }) {
  const products = detail.product_names ?? [];
  const upcs = detail.product_upcs ?? [];
  const firms = detail.firms ?? [];
  const states = detail.distribution_state_codes ?? [];
  const countries = detail.distribution_country_codes ?? [];
  const hazards = hazardNames(detail.hazards);
  const reasonCategories = (detail.reason_category ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const recallReason = htmlToText(detail.recall_reason);
  const consequence = htmlToText(detail.consequence_of_defect);
  const correctiveAction = htmlToText(detail.corrective_action);

  return (
    <article className="max-w-3xl">
      <nav className="text-sm text-muted">
        <a href="/recalls" className="no-underline hover:underline">
          Recalls
        </a>
        <span aria-hidden="true"> / </span>
        <span>{detail.source}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SourceBadge source={detail.source} />
        <ClassificationBadge
          source={detail.source}
          classification={detail.classification}
          riskLevel={detail.risk_level}
        />
        <StatusBadge isActive={detail.is_active} />
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
          {detail.distribution_scope}
        </span>
        {detail.has_been_edited && (
          <span
            className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
            title="The pipeline detected an editorially-meaningful change since first ingest (no date available)."
          >
            revised
          </span>
        )}
      </div>

      <h1 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
        {detail.title ?? `${detail.source} ${detail.source_recall_id}`}
      </h1>

      <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-4">
        <Field label="Announced">{formatDate(detail.announced_at)}</Field>
        <Field label="Published">{formatDate(detail.published_at)}</Field>
        <Field label="Recall ID">
          <span className="font-mono text-xs">{detail.source_recall_id}</span>
        </Field>
        <Field label="Lifecycle">{detail.lifecycle_status ?? '—'}</Field>
      </dl>

      {reasonCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted">Reason category</span>
          {reasonCategories.map((c) => (
            <span key={c} className="rounded-full border border-line px-2 py-0.5 text-xs">
              {c}
            </span>
          ))}
        </div>
      )}

      {recallReason && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Reason for recall</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink/90">{recallReason}</p>
        </section>
      )}

      {consequence && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold">Consequence</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink/90">{consequence}</p>
        </section>
      )}

      {correctiveAction && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold">Corrective action</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink/90">{correctiveAction}</p>
        </section>
      )}

      {hazards.length > 0 && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold">Hazard{hazards.length > 1 ? 's' : ''}</h2>
          {hazards.length === 1 ? (
            <p className="mt-1 text-sm text-ink/90">{hazards[0]}</p>
          ) : (
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-ink/90">
              {hazards.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {products.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Products ({detail.product_count})</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {products.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          {detail.models?.length || detail.hins?.length ? (
            <p className="mt-2 text-xs text-muted">
              {detail.models?.length ? `Models: ${detail.models.join(', ')}. ` : ''}
              {detail.hins?.length ? `HINs: ${detail.hins.join(', ')}.` : ''}
            </p>
          ) : null}
          {upcs.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-muted">
                Recall-level UPCs ({upcs.length})
              </p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {upcs.map((u) => (
                  <li
                    key={u}
                    className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs"
                  >
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {firms.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Firms ({detail.firm_count})</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {firms.map((f) => (
              <li key={`${f.firm_id}-${f.role}`}>
                <a
                  href={`/firms/${f.firm_id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-sm no-underline hover:bg-paper"
                  title={`Match: ${f.match_confidence}`}
                >
                  {f.name}
                  <span className="text-xs text-muted">{f.role}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(states.length > 0 || countries.length > 0 || detail.distribution_states) && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Distribution</h2>
          {states.length > 0 ? (
            <p className="mt-1 text-sm">
              <span className="text-muted">States: </span>
              {states.join(', ')}
            </p>
          ) : (
            detail.distribution_states && (
              <p className="mt-1 text-sm">
                <span className="text-muted">States (as reported): </span>
                {detail.distribution_states}
              </p>
            )
          )}
          {countries.length > 0 && (
            <p className="mt-1 text-sm">
              <span className="text-muted">Countries (foreign): </span>
              {countries.join(', ')}
            </p>
          )}
        </section>
      )}

      {detail.url && (
        <p className="mt-6 text-sm">
          <a href={detail.url} target="_blank" rel="noopener noreferrer">
            View the official {detail.source} recall notice →
          </a>
        </p>
      )}
    </article>
  );
}
