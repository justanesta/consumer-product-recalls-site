import { describe, expect, it } from 'vitest';
import type { GeographyCount, StatusCount, UnitsRow } from '@/lib/api/stats';
import { geographyData, statusBySource, unitsData } from './dashboard';

describe('statusBySource', () => {
  it('drops ALL and orders by source then status', () => {
    const rows: StatusCount[] = [
      { source: 'ALL', status: 'active', event_count: 9 },
      { source: 'FDA', status: 'inactive', event_count: 5 },
      { source: 'FDA', status: 'active', event_count: 3 },
      { source: 'CPSC', status: 'unknown', event_count: 7 },
    ];
    const out = statusBySource(rows);
    expect(out.some((d) => d.source === 'ALL')).toBe(false);
    expect(out.map((d) => `${d.source}:${d.status}`)).toEqual([
      'CPSC:unknown',
      'FDA:active',
      'FDA:inactive',
    ]);
  });
});

describe('geographyData', () => {
  it('filters by source and sorts by count desc', () => {
    const rows: GeographyCount[] = [
      { geography_basis: 'distribution', source: 'ALL', state_code: 'TX', recall_count: 10 },
      { geography_basis: 'distribution', source: 'ALL', state_code: 'CA', recall_count: 20 },
      { geography_basis: 'distribution', source: 'FDA', state_code: 'CA', recall_count: 5 },
    ];
    expect(geographyData(rows, 'ALL')).toEqual([
      { state: 'CA', count: 20 },
      { state: 'TX', count: 10 },
    ]);
  });
});

describe('unitsData', () => {
  it('drops zero-unit and old rows', () => {
    const rows: UnitsRow[] = [
      {
        source: 'FDA',
        unit_category: 'count',
        period: '2020-01-01',
        recalls_with_units: 1,
        total_units: 0,
        avg_units_per_recall: 0,
        max_units: 0,
      },
      {
        source: 'FDA',
        unit_category: 'count',
        period: '2024-01-01',
        recalls_with_units: 2,
        total_units: 100,
        avg_units_per_recall: 50,
        max_units: 80,
      },
    ];
    const out = unitsData(rows, { sinceYear: 2022 });
    expect(out).toHaveLength(1);
    expect(out[0]?.totalUnits).toBe(100);
  });
});
