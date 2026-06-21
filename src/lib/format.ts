const NUMBER_FMT = new Intl.NumberFormat('en-US');

/** Thousands-separated integer; em-dash for null/undefined. */
export function formatNumber(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? '—' : NUMBER_FMT.format(value);
}

/** Compact form for large counts (e.g. 93,444 -> 93.4k); falls back to full number under 10k. */
export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  if (Math.abs(value) < 10_000) return NUMBER_FMT.format(value);
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

/** ISO timestamp -> "Jun 19, 2026" (UTC); em-dash for null/invalid. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** "1 recall" / "2 recalls" (thousands-separated) — for chart tooltips and counts. */
export function recallsLabel(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? 'recall' : 'recalls'}`;
}

/** ISO timestamp/date -> "Jun 2026" (UTC month label); em-dash for null/invalid. */
export function formatMonth(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** ISO timestamp -> "Jun 19, 2026, 04:32 UTC"; em-dash for null/invalid. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(iso)}, ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })} UTC`;
}
