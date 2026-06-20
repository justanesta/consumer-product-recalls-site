import type { ReactNode } from 'react';
import type { FirmProfile } from '@/lib/api/firms';
import { formatDate } from '@/lib/format';

/** One key/value row inside an establishment card; renders nothing for empty values. */
function DefRow({ label, children }: { label: string; children: ReactNode }) {
  if (children == null || children === '') return null;
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** A single establishment/registry record card. */
function Card({
  tag,
  title,
  children,
}: {
  tag: string;
  title?: string | null;
  children: ReactNode;
}) {
  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-muted ring-1 ring-inset ring-line">
          {tag}
        </span>
        {title && <span className="font-medium">{title}</span>}
      </div>
      <dl className="mt-2 space-y-1">{children}</dl>
    </li>
  );
}

/** Compose a one-line postal address from heterogeneous source fields. */
function addressLine(p: {
  line1?: string | null;
  line2?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}): string | null {
  const street = [p.line1, p.line2, p.address].filter(Boolean).join(', ');
  const locality = [p.city, [p.state, p.zip].filter(Boolean).join(' ').trim()]
    .filter(Boolean)
    .join(', ');
  const country = p.country && !/united states|^u\.?s\.?a?\.?$/i.test(p.country) ? p.country : '';
  const out = [street, locality, country].filter(Boolean).join(' · ');
  return out || null;
}

/**
 * Agency registration "sidecars" attached to a canonical firm. Each source carries
 * a different shape (FDA FEI rows, USDA/FSIS establishments, USCG boat-MIC rows);
 * any may be empty, and CPSC/NHTSA contribute none. We render only what's present.
 */
export default function FirmEstablishments({ profile }: { profile: FirmProfile }) {
  const fda = profile.firm_fda_attributes ?? [];
  const usda = profile.firm_usda_attributes ?? [];
  const uscg = profile.firm_uscg_attributes ?? [];
  if (fda.length === 0 && usda.length === 0 && uscg.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Agency registration records</h2>
      <p className="mt-1 text-sm text-muted">
        Establishment and registry details matched to this firm. Each agency keeps different fields.
      </p>

      {usda.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            USDA / FSIS establishments
          </h3>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {usda.map((e, i) => (
              <Card key={i} tag={`Est. ${e.establishment_id}`} title={e.establishment_name}>
                <DefRow label="Address">
                  {addressLine({ address: e.address, city: e.city, state: e.state, zip: e.zip })}
                </DefRow>
                <DefRow label="County">{e.county}</DefRow>
                <DefRow label="Grant date">{e.grant_date ? formatDate(e.grant_date) : null}</DefRow>
                <DefRow label="Size">{e.size}</DefRow>
                <DefRow label="Status">{e.status_regulated_est}</DefRow>
                <DefRow label="Activities">{e.activities}</DefRow>
                <DefRow label="DBAs">{e.dbas}</DefRow>
              </Card>
            ))}
          </ul>
        </div>
      )}

      {uscg.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            USCG manufacturer directory
          </h3>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {uscg.map((m, i) => (
              <Card key={i} tag={`MIC ${m.mic}`} title={m.company_name}>
                <DefRow label="DBA">{m.dba}</DefRow>
                <DefRow label="Address">
                  {addressLine({
                    address: m.address,
                    city: m.city,
                    state: m.state,
                    zip: m.zip,
                    country: m.country,
                  })}
                </DefRow>
                <DefRow label="Status">{m.status}</DefRow>
                <DefRow label="In business">
                  {m.in_business || m.out_of_business
                    ? `${m.in_business ? formatDate(m.in_business) : '—'}${
                        m.out_of_business ? ` – ${formatDate(m.out_of_business)}` : ''
                      }`
                    : null}
                </DefRow>
                <DefRow label="Parent">{m.parent_company}</DefRow>
                <DefRow label="Directory">
                  {m.detail_url ? (
                    <a href={m.detail_url} target="_blank" rel="noopener noreferrer">
                      View in USCG directory →
                    </a>
                  ) : null}
                </DefRow>
              </Card>
            ))}
          </ul>
        </div>
      )}

      {fda.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            FDA establishments (FEI)
          </h3>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {fda.map((a, i) => (
              <Card key={i} tag={`FEI ${a.firm_fei_num}`} title={a.firm_legal_nam}>
                <DefRow label="Address">
                  {addressLine({
                    line1: a.firm_line1_adr,
                    line2: a.firm_line2_adr,
                    city: a.firm_city_nam,
                    state: a.firm_state_cd,
                    zip: a.firm_postal_cd,
                    country: a.firm_country_nam,
                  })}
                </DefRow>
                <DefRow label="Surviving">
                  {a.firm_surviving_nam
                    ? `${a.firm_surviving_nam}${a.firm_surviving_fei ? ` (FEI ${a.firm_surviving_fei})` : ''}`
                    : null}
                </DefRow>
              </Card>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
