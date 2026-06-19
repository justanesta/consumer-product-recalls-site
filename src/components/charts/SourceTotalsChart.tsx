import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import type { SourceTotal } from '@/lib/charts/transforms';
import { sourceColor } from '@/lib/domain/sources';
import { formatNumber } from '@/lib/format';

export interface SourceTotalsChartProps {
  data: SourceTotal[];
  title: string;
  caption?: string;
}

export default function SourceTotalsChart({ data, title, caption }: SourceTotalsChartProps) {
  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height: 220,
      marginLeft: 56,
      marginRight: 60,
      style: { background: 'transparent' },
      x: { grid: true, label: 'recalls', insetRight: 8 },
      y: { label: null, domain: data.map((d) => d.source) },
      marks: [
        Plot.barX(data, {
          x: 'count',
          y: 'source',
          fill: (d: SourceTotal) => sourceColor(d.source),
        }),
        Plot.ruleX([0]),
        Plot.text(data, {
          x: 'count',
          y: 'source',
          text: (d: SourceTotal) => formatNumber(d.count),
          textAnchor: 'start',
          dx: 4,
          fill: 'currentColor',
        }),
      ],
    }),
    [data],
  );

  const table = {
    columns: ['Source', 'Recalls'],
    rows: data.map((d): [string, string] => [d.source, formatNumber(d.count)]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={220} />;
}
