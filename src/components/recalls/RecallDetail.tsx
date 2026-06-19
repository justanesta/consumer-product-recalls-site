import type { ReactNode } from 'react';
import ClassificationBadge from '@/components/ClassificationBadge';
import SourceBadge from '@/components/SourceBadge';
import StatusBadge from '@/components/StatusBadge';
import type { RecallDetail as RecallDetailType } from '@/lib/api/recalls';
import { formatDate } from '@/lib/format';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export default function RecallDetail({ detail }: { detail: RecallDetailType }) {
  const products = detail.product_names ?? [];
  const firms = detail.firms ?? [];
  const states = detail.distribution_state_codes ?? [];
  const countries = detail.distribution_country_codes ?? [];

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

      {detail.recall_reason && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Reason for recall</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink/90">{detail.recall_reason}</p>
        </section>
      )}

      {detail.consequence_of_defect && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold">Consequence</h2>
          <p className="mt-1 text-sm text-ink/90">{detail.consequence_of_defect}</p>
        </section>
      )}

      {detail.corrective_action && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold">Corrective action</h2>
          <p className="mt-1 text-sm text-ink/90">{detail.corrective_action}</p>
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
        </section>
      )}

      {firms.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Firms</h2>
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

      {(states.length > 0 || countries.length > 0) && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Distribution</h2>
          {states.length > 0 && (
            <p className="mt-1 text-sm">
              <span className="text-muted">States: </span>
              {states.join(', ')}
            </p>
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
