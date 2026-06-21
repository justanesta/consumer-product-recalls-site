import type { ClassificationCount, PeriodCount } from '@/lib/api/stats';
import { classificationTone, type SeverityTone } from '@/lib/domain/classification';
import { SOURCE_ORDER } from '@/lib/domain/sources';

export interface TrendPoint {
  period: string;
  count: number;
}

/** A single source's monthly series, sorted ascending, optionally trimmed to recent years. */
export function monthlyTrend(
  rows: PeriodCount[],
  opts: { source?: string; sinceYear?: number } = {},
): TrendPoint[] {
  const { source = 'ALL', sinceYear } = opts;
  return rows
    .filter((r) => r.source === source)
    .filter((r) => (sinceYear ? Number(r.period.slice(0, 4)) >= sinceYear : true))
    .map((r) => ({ period: r.period, count: r.event_count }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export interface SourceTotal {
  source: string;
  count: number;
}

/**
 * Per-source totals summed from the classification breakdown (excludes the ALL
 * rollup), sorted by count descending so the highest-volume source leads.
 * Ties fall back to canonical source order for stable output.
 */
export function perSourceTotals(rows: ClassificationCount[]): SourceTotal[] {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.source === 'ALL') continue;
    totals.set(r.source, (totals.get(r.source) ?? 0) + r.event_count);
  }
  const order = SOURCE_ORDER as readonly string[];
  return SOURCE_ORDER.filter((s) => totals.has(s))
    .map((s) => ({ source: s, count: totals.get(s) ?? 0 }))
    .sort((a, b) => b.count - a.count || order.indexOf(a.source) - order.indexOf(b.source));
}

export interface ClassificationDatum {
  source: string;
  classification: string;
  count: number;
  tone: SeverityTone;
}

/**
 * Per-source classification rows (excludes the ALL rollup so vocabularies stay
 * source-scoped; null classification -> "Unclassified"). Carries a severity tone
 * for coloring only — the source-native label is the source of truth.
 */
export function classificationBySource(rows: ClassificationCount[]): ClassificationDatum[] {
  return rows
    .filter((r) => r.source !== 'ALL')
    .map((r) => ({
      source: r.source,
      classification: r.classification ?? 'Unclassified',
      count: r.event_count,
      tone: classificationTone(r.source, r.classification),
    }))
    .sort((a, b) => {
      const order = SOURCE_ORDER as readonly string[];
      return order.indexOf(a.source) - order.indexOf(b.source) || b.count - a.count;
    });
}

// --- Grouped classification table (landing page) ---

/** Severity rank for ordering codes within a source (lower = more severe). */
const TONE_RANK: Record<SeverityTone, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3,
  none: 4,
};

/**
 * Source order for the classification table: the sources that DO classify
 * (FDA, USDA, USCG) lead, then the ones that don't (CPSC, NHTSA) at the bottom.
 * Distinct from the canonical SOURCE_ORDER used elsewhere.
 */
const CLASSIFICATION_TABLE_SOURCE_ORDER = ['FDA', 'USDA', 'USCG', 'CPSC', 'NHTSA'];

export interface ClassificationGroup {
  source: string;
  total: number;
  /** Whether this source carries a real (non-null) classification vocabulary. */
  classified: boolean;
  /** Rows ordered most-severe → least-severe. */
  rows: ClassificationDatum[];
}

/**
 * Group the per-source classification breakdown for the landing-page table:
 * classified sources first, then unclassified; within each source, rows run
 * most-severe → least-severe (by tone, count as a tiebreak).
 */
export function classificationTableGroups(rows: ClassificationCount[]): ClassificationGroup[] {
  const order = CLASSIFICATION_TABLE_SOURCE_ORDER;
  const rank = (s: string): number => {
    const i = order.indexOf(s);
    return i < 0 ? order.length : i;
  };

  const bySource = new Map<string, ClassificationDatum[]>();
  for (const datum of classificationBySource(rows)) {
    const list = bySource.get(datum.source) ?? [];
    list.push(datum);
    bySource.set(datum.source, list);
  }

  return [...bySource.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .map((source) => {
      const sourceRows = (bySource.get(source) ?? [])
        .slice()
        .sort((a, b) => TONE_RANK[a.tone] - TONE_RANK[b.tone] || b.count - a.count);
      const total = sourceRows.reduce((sum, d) => sum + d.count, 0);
      const classified = sourceRows.some((d) => d.tone !== 'none');
      return { source, total, classified, rows: sourceRows };
    });
}
