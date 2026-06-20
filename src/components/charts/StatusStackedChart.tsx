import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import {
  STATUS_LABEL,
  STATUS_ORDER,
  type StatusDatum,
  type StatusKey,
} from '@/lib/charts/dashboard';
import { SOURCE_ORDER } from '@/lib/domain/sources';
import { formatNumber, recallsLabel } from '@/lib/format';

const STATUS_COLOR: Record<StatusKey, string> = {
  active: '#b91c1c',
  inactive: '#475569',
  unknown: '#9ca3af',
};

export interface StatusStackedChartProps {
  data: StatusDatum[];
  title: string;
  caption?: string;
}

export default function StatusStackedChart({ data, title, caption }: StatusStackedChartProps) {
  // Order sources by total bar height, descending (biggest at top); canonical
  // SOURCE_ORDER breaks ties so the layout is stable.
  const sourceRank = (s: string) => (SOURCE_ORDER as readonly string[]).indexOf(s);
  const totals = new Map<string, number>();
  for (const d of data) totals.set(d.source, (totals.get(d.source) ?? 0) + d.count);
  const sources = [...totals.keys()].sort(
    (a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0) || sourceRank(a) - sourceRank(b),
  );
  const height = 56 + sources.length * 42;

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height,
      marginLeft: 56,
      style: { background: 'transparent' },
      x: { label: 'recalls', grid: true },
      y: { label: null, domain: sources },
      color: {
        domain: STATUS_ORDER,
        range: STATUS_ORDER.map((s) => STATUS_COLOR[s]),
        legend: true,
        tickFormat: (s: StatusKey) => STATUS_LABEL[s],
      },
      marks: [
        Plot.barX(data, {
          x: 'count',
          y: 'source',
          fill: 'status',
          title: (d: StatusDatum) =>
            `${d.source} · ${STATUS_LABEL[d.status]}\n${recallsLabel(d.count)}`,
          tip: true,
        }),
        Plot.ruleX([0]),
      ],
    }),
    [data, height, sources],
  );

  const table = {
    columns: ['Source', 'Status', 'Recalls'],
    rows: data.map((d): [string, string, string] => [
      d.source,
      STATUS_LABEL[d.status],
      formatNumber(d.count),
    ]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={height} />;
}
