import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import type { UnitsDatum } from '@/lib/charts/dashboard';
import { formatNumber } from '@/lib/format';

export interface UnitsChartProps {
  data: UnitsDatum[];
  title: string;
  caption?: string;
}

export default function UnitsChart({ data, title, caption }: UnitsChartProps) {
  const facetCount = new Set(data.map((d) => d.source)).size || 1;
  const height = 60 + facetCount * 120;

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height,
      marginLeft: 64,
      style: { background: 'transparent' },
      x: { type: 'utc', label: null },
      y: { type: 'log', label: 'units (log)', grid: true, ticks: 3 },
      fy: { label: null },
      color: { legend: true, label: 'unit category' },
      marks: [
        Plot.lineY(data, {
          x: (d: UnitsDatum) => new Date(d.month),
          y: 'totalUnits',
          fy: 'source',
          stroke: 'category',
          curve: 'monotone-x',
        }),
      ],
    }),
    [data, height],
  );

  const table = {
    columns: ['Month', 'Source', 'Category', 'Total units'],
    rows: data.map((d): [string, string, string, string] => [
      d.month.slice(0, 7),
      d.source,
      d.category,
      formatNumber(d.totalUnits),
    ]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={height} />;
}
