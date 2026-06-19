import * as Plot from '@observablehq/plot';
import { useCallback } from 'react';
import Chart from '@/components/Chart';
import { TONE_COLOR } from '@/lib/charts/colors';
import type { ClassificationDatum } from '@/lib/charts/transforms';
import { formatNumber } from '@/lib/format';

export interface ClassificationFacetChartProps {
  data: ClassificationDatum[];
  title: string;
  caption?: string;
}

export default function ClassificationFacetChart({
  data,
  title,
  caption,
}: ClassificationFacetChartProps) {
  const facetCount = new Set(data.map((d) => d.source)).size;
  const height = 60 + facetCount * 70;

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height,
      marginLeft: 92,
      marginRight: 16,
      style: { background: 'transparent' },
      x: { grid: true, label: 'recalls' },
      y: { label: null },
      fy: { label: null },
      marks: [
        Plot.barX(data, {
          x: 'count',
          y: 'classification',
          fy: 'source',
          fill: (d: ClassificationDatum) => TONE_COLOR[d.tone],
          sort: { y: '-x' },
        }),
        Plot.ruleX([0]),
      ],
    }),
    [data, height],
  );

  const table = {
    columns: ['Source', 'Classification', 'Recalls'],
    rows: data.map((d): [string, string, string] => [
      d.source,
      d.classification,
      formatNumber(d.count),
    ]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={height} />;
}
