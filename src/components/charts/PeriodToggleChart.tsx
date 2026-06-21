import * as Plot from '@observablehq/plot';
import { useCallback, useState } from 'react';
import Chart from '@/components/Chart';
import { BRAND_HEX } from '@/lib/charts/colors';
import type { TrendPoint } from '@/lib/charts/transforms';
import { formatDate, formatMonth, formatNumber, recallsLabel } from '@/lib/format';

type Grain = 'week' | 'month' | 'year';

export interface PeriodToggleChartProps {
  week: TrendPoint[];
  month: TrendPoint[];
  year: TrendPoint[];
  title: string;
  caption?: string;
}

const GRAINS: Grain[] = ['week', 'month', 'year'];

export default function PeriodToggleChart({
  week,
  month,
  year,
  title,
  caption,
}: PeriodToggleChartProps) {
  const [grain, setGrain] = useState<Grain>('month');
  const series = { week, month, year };
  const data = series[grain];

  const periodLabel = useCallback(
    (iso: string): string =>
      grain === 'year'
        ? iso.slice(0, 4)
        : grain === 'week'
          ? `Week of ${formatDate(iso)}`
          : formatMonth(iso),
    [grain],
  );

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height: 300,
      marginLeft: 48,
      style: { background: 'transparent' },
      x: { type: 'utc', label: null },
      y: { grid: true, label: `recalls / ${grain}` },
      marks: [
        Plot.rectY(data, {
          x: (d: TrendPoint) => new Date(d.period),
          y: 'count',
          interval: grain,
          fill: BRAND_HEX,
        }),
        Plot.ruleY([0]),
        Plot.tip(
          data,
          Plot.pointerX({
            x: (d: TrendPoint) => new Date(d.period),
            y: 'count',
            title: (d: TrendPoint) => `${periodLabel(d.period)}\n${recallsLabel(d.count)}`,
          }),
        ),
      ],
    }),
    [data, grain, periodLabel],
  );

  const table = {
    columns: [grain === 'year' ? 'Year' : grain === 'week' ? 'Week of' : 'Month', 'Recalls'],
    rows: data.map((d): [string, string] => [
      grain === 'year' ? d.period.slice(0, 4) : d.period.slice(0, 10),
      formatNumber(d.count),
    ]),
  };

  return (
    <div>
      <div
        className="mb-2 inline-flex rounded-md border border-line p-0.5"
        role="group"
        aria-label="Time grain"
      >
        {GRAINS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGrain(g)}
            aria-pressed={grain === g}
            className={`rounded px-3 py-1 text-sm capitalize ${
              grain === g ? 'bg-brand text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <Chart
        spec={spec}
        title={`${title} (by ${grain})`}
        caption={caption}
        table={table}
        height={300}
      />
    </div>
  );
}
