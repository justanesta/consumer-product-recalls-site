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

/** Per-source totals summed from the classification breakdown (excludes the ALL rollup). */
export function perSourceTotals(rows: ClassificationCount[]): SourceTotal[] {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.source === 'ALL') continue;
    totals.set(r.source, (totals.get(r.source) ?? 0) + r.event_count);
  }
  return SOURCE_ORDER.filter((s) => totals.has(s)).map((s) => ({
    source: s,
    count: totals.get(s) ?? 0,
  }));
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
