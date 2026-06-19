import * as Plot from '@observablehq/plot';
import { useEffect, useRef, useState } from 'react';

export interface ChartTable {
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface ChartProps {
  /** Build the Observable Plot spec for a measured pixel width. */
  spec: (width: number) => Plot.PlotOptions;
  /** Short accessible description of what the chart shows (used as the SVG aria-label). */
  title: string;
  caption?: string;
  /** Accessible tabular fallback of the underlying data (disclosure-toggled). */
  table?: ChartTable;
  /** Reserved height (px) before measurement, to avoid layout shift. */
  height?: number;
}

/**
 * Framework-agnostic chart primitive: renders an Observable Plot spec into a
 * responsive container and ships an accessible data-table fallback.
 *
 * NOTE: takes a `spec` function, so it is composed *inside* React chart islands
 * (Astro can't pass functions across the island boundary). Concrete chart
 * components pass serializable data in and build the spec here.
 */
export default function Chart({ spec, title, caption, table, height = 320 }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Measure the container width responsively.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.floor(measured));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // (Re)render the plot when the width or spec changes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || width === 0) return;
    const node = Plot.plot(spec(width));
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', caption ? `${title}. ${caption}` : title);
    el.replaceChildren(node);
    return () => el.replaceChildren();
  }, [spec, width, title, caption]);

  return (
    <figure className="my-2">
      <div ref={containerRef} className="w-full" style={{ minHeight: height }} />
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
      {table && table.rows.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-muted hover:text-ink">View data as table</summary>
          <div className="mt-2 max-h-72 overflow-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">{title}</caption>
              <thead className="sticky top-0 bg-surface">
                <tr>
                  {table.columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="border-b border-line px-2 py-1 font-medium"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
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
