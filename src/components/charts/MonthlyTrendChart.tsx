import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import type { TrendSeriesPoint } from '@/lib/charts/dashboard';
import { sourceColor } from '@/lib/domain/sources';
import { formatMonth, formatNumber, recallsLabel } from '@/lib/format';

export interface MonthlyTrendChartProps {
  data: TrendSeriesPoint[];
  title: string;
  caption?: string;
}

export default function MonthlyTrendChart({ data, title, caption }: MonthlyTrendChartProps) {
  const facetCount = new Set(data.map((d) => d.source)).size || 1;
  const height = 60 + facetCount * 110;

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height,
      marginLeft: 48,
      style: { background: 'transparent' },
      x: { type: 'utc', label: null },
      y: { label: null, grid: true, ticks: 3 },
      fy: { label: null },
      marks: [
        Plot.lineY(data, {
          x: (d: TrendSeriesPoint) => new Date(d.month),
          y: 'count',
          fy: 'source',
          stroke: (d: TrendSeriesPoint) => sourceColor(d.source),
          strokeOpacity: 0.25,
        }),
        Plot.lineY(
          data.filter((d) => d.rolling != null),
          {
            x: (d: TrendSeriesPoint) => new Date(d.month),
            y: 'rolling',
            fy: 'source',
            stroke: (d: TrendSeriesPoint) => sourceColor(d.source),
            strokeWidth: 1.75,
          },
        ),
        Plot.ruleY([0]),
        Plot.tip(
          data,
          Plot.pointerX({
            x: (d: TrendSeriesPoint) => new Date(d.month),
            y: 'count',
            fy: 'source',
            title: (d: TrendSeriesPoint) =>
              `${d.source} · ${formatMonth(d.month)}\n${recallsLabel(d.count)}` +
              (d.rolling != null ? `\n3-mo avg ${d.rolling.toFixed(1)}` : ''),
          }),
        ),
      ],
    }),
    [data, height],
  );

  const table = {
    columns: ['Month', 'Source', 'Recalls', '3-mo avg'],
    rows: data.map((d): [string, string, string, string] => [
      d.month.slice(0, 7),
      d.source,
      formatNumber(d.count),
      d.rolling == null ? '—' : d.rolling.toFixed(1),
    ]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={height} />;
}
