import type { SeverityTone } from '@/lib/domain/classification';

/** Brand accent used for single-series charts (matches the `brand` token). */
export const BRAND_HEX = '#1e407c';

/** Severity-tone fill colors for classification bars (decorative; label carries meaning). */
export const TONE_COLOR: Record<SeverityTone, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#059669',
  info: '#64748b',
  none: '#94a3b8',
};
