import type { GeographyCount, MonthlyTrendPoint, StatusCount, UnitsRow } from '@/lib/api/stats';
import { SOURCE_ORDER } from '@/lib/domain/sources';

const sourceRank = (s: string): number => (SOURCE_ORDER as readonly string[]).indexOf(s);

// --- Monthly trend (per source, event count + 3-month rolling average) ---
export interface TrendSeriesPoint {
  month: string;
  source: string;
  count: number;
  rolling: number | null;
}

export function sourceTrend(
  rows: MonthlyTrendPoint[],
  opts: { sinceYear?: number } = {},
): TrendSeriesPoint[] {
  const { sinceYear } = opts;
  return rows
    .filter((r) => (sinceYear ? Number(r.month.slice(0, 4)) >= sinceYear : true))
    .map((r) => ({
      month: r.month,
      source: r.source,
      count: r.event_count,
      rolling: r.rolling_3mo_avg ?? null,
    }))
    .sort((a, b) => sourceRank(a.source) - sourceRank(b.source) || a.month.localeCompare(b.month));
}

// --- Active / inactive / unknown status per source ---
export type StatusKey = 'active' | 'inactive' | 'unknown';
export const STATUS_ORDER: StatusKey[] = ['active', 'inactive', 'unknown'];
export const STATUS_LABEL: Record<StatusKey, string> = {
  active: 'Active',
  inactive: 'Inactive',
  unknown: 'No lifecycle',
};

export interface StatusDatum {
  source: string;
  status: StatusKey;
  count: number;
}

export function statusBySource(rows: StatusCount[]): StatusDatum[] {
  return rows
    .filter((r) => r.source !== 'ALL')
    .map((r) => ({ source: r.source, status: r.status as StatusKey, count: r.event_count }))
    .sort(
      (a, b) =>
        sourceRank(a.source) - sourceRank(b.source) ||
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );
}

// --- Geography (one basis at a time) ---
export interface GeoDatum {
  state: string;
  count: number;
}

export function geographyData(rows: GeographyCount[], source = 'ALL'): GeoDatum[] {
  return rows
    .filter((r) => r.source === source)
    .map((r) => ({ state: r.state_code, count: r.recall_count }))
    .sort((a, b) => b.count - a.count);
}

// --- Units recalled (source x category x month; not cross-source comparable) ---
export interface UnitsDatum {
  source: string;
  category: string;
  month: string;
  totalUnits: number;
}

export function unitsData(rows: UnitsRow[], opts: { sinceYear?: number } = {}): UnitsDatum[] {
  const { sinceYear } = opts;
  return rows
    .filter((r) => (sinceYear ? Number(r.period.slice(0, 4)) >= sinceYear : true))
    .filter((r) => r.total_units > 0)
    .map((r) => ({
      source: r.source,
      category: r.unit_category,
      month: r.period,
      totalUnits: r.total_units,
    }))
    .sort((a, b) => sourceRank(a.source) - sourceRank(b.source) || a.month.localeCompare(b.month));
}
