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

/** A tooltip expanding a classification code, using each agency's own published definition. */
export function classificationHint(
  source: string,
  classification?: string | null,
): string | undefined {
  const c = classification?.trim();
  if (!c) return undefined;
  if (source === 'FDA') {
    // Verbatim from FDA "Recalls: Background and Definitions" (fda.gov).
    const fda: Record<string, string> = {
      '1': 'Class I recall: a situation in which there is a reasonable probability that the use of or exposure to a violative product will cause serious adverse health consequences or death.',
      '2': 'Class II recall: a situation in which use of or exposure to a violative product may cause temporary or medically reversible adverse health consequences or where the probability of serious adverse health consequences is remote.',
      '3': 'Class III recall: a situation in which use of or exposure to a violative product is not likely to cause adverse health consequences.',
      NC: 'Not yet classified.',
    };
    return fda[c] ? fda[c] : `FDA classification ${c}`;
  }
  if (source === 'USDA') {
    // Verbatim from USDA FSIS "Understanding FSIS Food Recalls" (fsis.usda.gov).
    const usda: Record<string, string> = {
      'Class I':
        'Class I - A Class I recall involves a health hazard situation where there is a reasonable probability that use of the product will cause serious, adverse health consequences or death.',
      'Class II':
        'Class II - A Class II recall involves a health hazard situation where there is a remote probability of adverse health consequences from use of the product.',
      'Class III':
        'Class III - A Class III recall involves a situation where use of the product will not cause adverse health consequences, or the risk is negligible.',
    };
    return usda[c] ? usda[c] : `USDA classification: ${c}`;
  }
  return `${source} classification: ${c}`;
}
