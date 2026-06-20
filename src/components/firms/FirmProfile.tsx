import type { FirmProfile as FirmProfileType } from '@/lib/api/firms';
import { getSourceMeta, SOURCE_ORDER, sourceColor } from '@/lib/domain/sources';
import { formatDate, formatNumber } from '@/lib/format';
import FirmEstablishments from './FirmEstablishments';

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-serif text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export default function FirmProfile({ profile }: { profile: FirmProfileType }) {
  const bySource = profile.recalls_by_source ?? {};
  const entries = SOURCE_ORDER.filter((s) => bySource[s]).map((s) => ({
    source: s,
    count: bySource[s] ?? 0,
  }));
  const max = Math.max(1, ...entries.map((e) => e.count));
  const aliases = (profile.alternate_names ?? []).filter((a) => a !== profile.canonical_name);

  return (
    <article className="max-w-3xl">
      <nav className="text-sm text-muted">
        <a href="/" className="no-underline hover:underline">
          Home
        </a>
        <span aria-hidden="true"> / </span>
        <span>Firm</span>
      </nav>

      <h1 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{profile.canonical_name}</h1>
      {aliases.length > 0 && (
        <p className="mt-1 text-sm text-muted">Also known as: {aliases.join(', ')}</p>
      )}
      {(profile.roles ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(profile.roles ?? []).map((role) => (
            <span
              key={role}
              className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
            >
              {role}
            </span>
          ))}
        </div>
      )}

      {profile.first_recall_at && (
        <p className="mt-2 text-sm text-muted">
          Recalls span {formatDate(profile.first_recall_at)} – {formatDate(profile.last_recall_at)}.
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total recalls" value={formatNumber(profile.total_recalls)} />
        <Kpi label="Active" value={formatNumber(profile.active_recalls)} />
        <Kpi label="Products" value={formatNumber(profile.distinct_products)} />
        <Kpi label="Latest" value={formatDate(profile.last_recall_at)} />
      </dl>

      {entries.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Recalls by source</h2>
          <ul className="mt-2 space-y-2">
            {entries.map((e) => (
              <li
                key={e.source}
                className="grid grid-cols-[3.5rem_1fr_3rem] items-center gap-2 text-sm"
              >
                <span className="font-medium">{getSourceMeta(e.source)?.label ?? e.source}</span>
                <span className="h-2 overflow-hidden rounded-full bg-line/40">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${((e.count / max) * 100).toFixed(1)}%`,
                      background: sourceColor(e.source),
                    }}
                  />
                </span>
                <span className="text-right tabular-nums">{formatNumber(e.count)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FirmEstablishments profile={profile} />
    </article>
  );
}
