import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import { BRAND_HEX } from '@/lib/charts/colors';
import type { TrendPoint } from '@/lib/charts/transforms';
import { formatMonth, formatNumber, recallsLabel } from '@/lib/format';

export interface AreaTrendChartProps {
  data: TrendPoint[];
  title: string;
  caption?: string;
}

export default function AreaTrendChart({ data, title, caption }: AreaTrendChartProps) {
  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height: 300,
      marginLeft: 52,
      style: { background: 'transparent' },
      x: { type: 'utc', label: null },
      y: { grid: true, label: 'recalls / month', insetTop: 6 },
      marks: [
        Plot.areaY(data, {
          x: (d: TrendPoint) => new Date(d.period),
          y: 'count',
          fill: BRAND_HEX,
          fillOpacity: 0.12,
          curve: 'monotone-x',
        }),
        Plot.lineY(data, {
          x: (d: TrendPoint) => new Date(d.period),
          y: 'count',
          stroke: BRAND_HEX,
          strokeWidth: 1.5,
          curve: 'monotone-x',
        }),
        Plot.ruleY([0]),
        Plot.tip(
          data,
          Plot.pointerX({
            x: (d: TrendPoint) => new Date(d.period),
            y: 'count',
            title: (d: TrendPoint) => `${formatMonth(d.period)}\n${recallsLabel(d.count)}`,
          }),
        ),
      ],
    }),
    [data],
  );

  const table = {
    columns: ['Month', 'Recalls'],
    rows: data.map((d): [string, string] => [d.period.slice(0, 7), formatNumber(d.count)]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={300} />;
}
