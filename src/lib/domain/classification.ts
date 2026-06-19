export type SeverityTone = 'high' | 'medium' | 'low' | 'info' | 'none';

/**
 * Map a SOURCE-NATIVE classification to a coarse severity tone, for coloring only.
 *
 * The displayed text must stay the raw, source-native value — classifications are
 * NOT comparable across sources (FDA 1/2/3/NC ≠ USDA Class I/II/III ≠ USCG H/L/M/S),
 * so this is purely a visual hint, never a unified scale.
 */
export function classificationTone(source: string, classification?: string | null): SeverityTone {
  const c = classification?.trim();
  if (!c) return 'none';
  switch (source) {
    case 'FDA':
      if (c === '1') return 'high';
      if (c === '2') return 'medium';
      if (c === '3') return 'low';
      return 'info'; // NC = Not yet classified
    case 'USDA':
      if (c === 'Class I') return 'high';
      if (c === 'Class II') return 'medium';
      if (c === 'Class III') return 'low';
      return 'info'; // Public Health Alert
    case 'USCG':
      if (c === 'H') return 'high';
      if (c === 'M') return 'medium';
      if (c === 'L') return 'low';
      return 'info';
    default:
      return 'info';
  }
}

/** A human tooltip expanding a terse code, where the meaning is well-documented (FDA). */
export function classificationHint(
  source: string,
  classification?: string | null,
): string | undefined {
  const c = classification?.trim();
  if (!c) return undefined;
  if (source === 'FDA') {
    const fda: Record<string, string> = {
      '1': 'Class 1 — most serious (reasonable probability of serious harm or death)',
      '2': 'Class 2 — temporary or medically reversible harm',
      '3': 'Class 3 — unlikely to cause harm',
      NC: 'Not yet classified',
    };
    return fda[c] ? `FDA ${fda[c]}` : `FDA classification ${c}`;
  }
  return `${source} classification: ${c}`;
}
