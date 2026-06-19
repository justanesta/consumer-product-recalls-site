import type { Source } from '@/lib/api/recalls';

/** Source-native classification vocabularies (for building source-scoped filter UIs). */
export const CLASSIFICATION_BY_SOURCE: Record<Source, string[]> = {
  CPSC: [],
  FDA: ['1', '2', '3', 'NC'],
  USDA: ['Class I', 'Class II', 'Class III', 'Public Health Alert'],
  NHTSA: [],
  USCG: ['H', 'M', 'L', 'S'],
};

/**
 * The classifications worth offering for the currently-selected sources.
 * With no source selected, classification is meaningless (it's source-native),
 * so we return an empty list — the UI hides the control.
 */
export function classificationsForSources(sources: Source[]): string[] {
  if (sources.length === 0) return [];
  const out: string[] = [];
  for (const source of sources) {
    for (const code of CLASSIFICATION_BY_SOURCE[source]) {
      if (!out.includes(code)) out.push(code);
    }
  }
  return out;
}
