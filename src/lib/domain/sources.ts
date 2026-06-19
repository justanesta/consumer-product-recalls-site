import type { Source } from '@/lib/api/recalls';

export interface SourceMeta {
  code: Source;
  /** Short badge label. */
  label: string;
  /** Full agency name. */
  name: string;
  /** Fixed chart/badge color (matches tailwind `source.*` tokens; colorblind-safe Okabe–Ito). */
  hex: string;
  /** One-line scope of what the agency recalls. */
  scope: string;
}

export const SOURCES: Record<Source, SourceMeta> = {
  CPSC: {
    code: 'CPSC',
    label: 'CPSC',
    name: 'Consumer Product Safety Commission',
    hex: '#0072B2',
    scope: 'Consumer products — toys, electronics, household goods.',
  },
  FDA: {
    code: 'FDA',
    label: 'FDA',
    name: 'Food & Drug Administration',
    hex: '#D55E00',
    scope: 'Food, drugs, medical devices, and cosmetics.',
  },
  USDA: {
    code: 'USDA',
    label: 'USDA',
    name: 'U.S. Department of Agriculture (FSIS)',
    hex: '#009E73',
    scope: 'Meat, poultry, and processed egg products.',
  },
  NHTSA: {
    code: 'NHTSA',
    label: 'NHTSA',
    name: 'National Highway Traffic Safety Administration',
    hex: '#CC79A7',
    scope: 'Vehicles and motor-vehicle equipment.',
  },
  USCG: {
    code: 'USCG',
    label: 'USCG',
    name: 'U.S. Coast Guard',
    hex: '#56B4E9',
    scope: 'Recreational boats and associated equipment.',
  },
};

/** Canonical display order of the five sources. */
export const SOURCE_ORDER: Source[] = ['CPSC', 'FDA', 'USDA', 'NHTSA', 'USCG'];

export function getSourceMeta(source: string): SourceMeta | undefined {
  return (SOURCES as Record<string, SourceMeta>)[source];
}

/** Chart color for a source code, or a neutral grey for the `ALL` rollup / unknowns. */
export function sourceColor(source: string): string {
  return getSourceMeta(source)?.hex ?? '#64748b';
}
