import * as Plot from '@observablehq/plot';
import type { Feature } from 'geojson';
import { feature } from 'topojson-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from '@/components/Chart';
import type { GeoDatum } from '@/lib/charts/dashboard';
import { FIPS_BY_POSTAL } from '@/lib/geo/fips';
import { formatNumber } from '@/lib/format';

export interface ChoroplethProps {
  data: GeoDatum[];
  title: string;
  caption?: string;
  /** Observable Plot sequential color scheme. */
  scheme?: string;
}

export default function Choropleth({ data, title, caption, scheme = 'blues' }: ChoroplethProps) {
  const [states, setStates] = useState<Feature[]>([]);

  // Load the vendored US states topology once, client-side (kept out of the JS bundle).
  useEffect(() => {
    let alive = true;
    fetch('/geo/states-10m.json')
      .then((r) => r.json())
      .then((topo) => {
        if (!alive) return;
        const fc = feature(topo, topo.objects.states) as unknown as { features: Feature[] };
        setStates(fc.features);
      })
      .catch(() => setStates([]));
    return () => {
      alive = false;
    };
  }, []);

  const countByFips = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) {
      const fips = FIPS_BY_POSTAL[d.state];
      if (fips) map.set(fips, d.count);
    }
    return map;
  }, [data]);

  const spec = useCallback(
    (width: number): Plot.PlotOptions => ({
      width,
      height: Math.round(width * 0.6),
      projection: 'albers-usa',
      style: { background: 'transparent' },
      color: {
        type: 'quantile',
        n: 6,
        scheme: scheme as Plot.ColorScheme,
        legend: true,
        label: 'recalls',
        unknown: '#e5e7eb',
      },
      marks: [
        Plot.geo(states, {
          fill: (d: Feature) => countByFips.get(String(d.id)),
          stroke: 'white',
          strokeWidth: 0.5,
          title: (d: Feature) =>
            `${(d.properties as { name?: string } | null)?.name ?? d.id}: ${formatNumber(
              countByFips.get(String(d.id)) ?? 0,
            )}`,
        }),
      ],
    }),
    [states, countByFips, scheme],
  );

  const table = {
    columns: ['State', 'Recalls'],
    rows: data.slice(0, 12).map((d): [string, string] => [d.state, formatNumber(d.count)]),
  };

  return <Chart spec={spec} title={title} caption={caption} table={table} height={420} />;
}
