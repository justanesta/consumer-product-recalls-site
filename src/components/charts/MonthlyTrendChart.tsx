import * as Plot from '@observablehq/plot';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type TrendSeriesPoint } from '@/lib/charts/dashboard';
import { getSourceMeta, SOURCE_ORDER, sourceColor } from '@/lib/domain/sources';
import { formatMonth, formatNumber, recallsLabel } from '@/lib/format';

export interface MonthlyTrendChartProps {
  data: TrendSeriesPoint[];
  title: string;
  caption?: string;
}

/**
 * Small multiples: one mini line chart per source, each with its OWN y-scale so a
 * low-volume source (USCG, USDA) shows its real trend shape instead of a flat line
 * under FDA. The time x-axis is shared (and only drawn on the last row).
 */
export default function MonthlyTrendChart({ data, title, caption }: MonthlyTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const sources = useMemo(
    () => SOURCE_ORDER.filter((s) => data.some((d) => d.source === s)),
    [data],
  );
  const reserved = 24 + sources.length * 112;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.floor(entries[0]?.contentRect.width ?? 0)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || width === 0) return;
    const times = data.map((d) => new Date(d.month).getTime());
    const xDomain: [Date, Date] = [new Date(Math.min(...times)), new Date(Math.max(...times))];

    const root = document.createElement('div');
    root.className = 'space-y-2';
    sources.forEach((source, i) => {
      const sd = data.filter((d) => d.source === source);
      const maxY = Math.max(1, ...sd.map((d) => d.count));
      const isLast = i === sources.length - 1;
      const color = sourceColor(source);
      const xOf = (d: TrendSeriesPoint) => new Date(d.month);

      const block = document.createElement('div');
      const label = document.createElement('div');
      label.className = 'text-xs font-medium';
      label.textContent = getSourceMeta(source)?.label ?? source;
      block.appendChild(label);

      const plot = Plot.plot({
        width,
        height: isLast ? 100 : 80,
        marginLeft: 40,
        marginTop: 6,
        marginBottom: isLast ? 22 : 4,
        style: { background: 'transparent' },
        x: { type: 'utc', domain: xDomain, label: null, axis: isLast ? 'bottom' : null },
        y: { domain: [0, maxY], ticks: 2, label: null, grid: true },
        marks: [
          Plot.lineY(sd, { x: xOf, y: 'count', stroke: color, strokeOpacity: 0.3 }),
          Plot.lineY(
            sd.filter((d) => d.rolling != null),
            { x: xOf, y: 'rolling', stroke: color, strokeWidth: 1.75 },
          ),
          Plot.ruleY([0]),
          Plot.tip(
            sd,
            Plot.pointerX({
              x: xOf,
              y: 'count',
              title: (d: TrendSeriesPoint) =>
                `${source} · ${formatMonth(d.month)}\n${recallsLabel(d.count)}` +
                (d.rolling != null ? `\n3-mo avg ${d.rolling.toFixed(1)}` : ''),
            }),
          ),
        ],
      });
      plot.setAttribute('role', 'img');
      plot.setAttribute('aria-label', `${getSourceMeta(source)?.name ?? source}: monthly recalls`);
      block.appendChild(plot);
      root.appendChild(block);
    });
    el.replaceChildren(root);
    return () => el.replaceChildren();
  }, [width, data, sources]);

  const rows = data.map((d): [string, string, string, string] => [
    d.month.slice(0, 7),
    d.source,
    formatNumber(d.count),
    d.rolling == null ? '—' : d.rolling.toFixed(1),
  ]);

  return (
    <figure className="my-2">
      <div ref={containerRef} className="w-full" style={{ minHeight: reserved }} />
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
      {rows.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-muted hover:text-ink">View data as table</summary>
          <div className="mt-2 max-h-72 overflow-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">{title}</caption>
              <thead className="sticky top-0 bg-surface">
                <tr>
                  {['Month', 'Source', 'Recalls', '3-mo avg'].map((c) => (
                    <th key={c} scope="col" className="border-b border-line px-2 py-1 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="border-b border-line px-2 py-1 tabular-nums">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}
