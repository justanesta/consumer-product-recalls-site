import { describe, expect, it } from 'vitest';
import type { ClassificationCount, PeriodCount } from '@/lib/api/stats';
import { classificationBySource, monthlyTrend, perSourceTotals } from './transforms';

const periods: PeriodCount[] = [
  { period: '2010-01-01', source: 'ALL', event_count: 5 },
  { period: '2012-03-01', source: 'ALL', event_count: 10 },
  { period: '2011-02-01', source: 'ALL', event_count: 7 },
  { period: '2012-01-01', source: 'CPSC', event_count: 3 },
];

const classes: ClassificationCount[] = [
  { source: 'ALL', classification: null, event_count: 100 },
  { source: 'CPSC', classification: null, event_count: 30 },
  { source: 'FDA', classification: '1', event_count: 20 },
  { source: 'FDA', classification: '2', event_count: 50 },
];

describe('monthlyTrend', () => {
  it('filters by source, sorts ascending, and trims by year', () => {
    const trend = monthlyTrend(periods, { source: 'ALL', sinceYear: 2011 });
    expect(trend.map((p) => p.period)).toEqual(['2011-02-01', '2012-03-01']);
    expect(trend[0]).toEqual({ period: '2011-02-01', count: 7 });
  });
});

describe('perSourceTotals', () => {
  it('sums per source, excludes ALL, keeps canonical order', () => {
    expect(perSourceTotals(classes)).toEqual([
      { source: 'CPSC', count: 30 },
      { source: 'FDA', count: 70 },
    ]);
  });
});

describe('classificationBySource', () => {
  it('drops ALL, maps null to Unclassified, and tags a severity tone', () => {
    const data = classificationBySource(classes);
    expect(data.find((d) => d.source === 'CPSC')).toMatchObject({
      classification: 'Unclassified',
      tone: 'none',
    });
    expect(data.find((d) => d.classification === '1')).toMatchObject({
      source: 'FDA',
      tone: 'high',
    });
    expect(data.some((d) => d.source === 'ALL')).toBe(false);
  });
});
