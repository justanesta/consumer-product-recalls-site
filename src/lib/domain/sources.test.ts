import { describe, expect, it } from 'vitest';
import { getSourceMeta, SOURCE_ORDER, SOURCES, sourceColor } from './sources';

describe('sources', () => {
  it('covers all five sources in canonical order', () => {
    expect(SOURCE_ORDER).toEqual(['CPSC', 'FDA', 'USDA', 'NHTSA', 'USCG']);
    expect(Object.keys(SOURCES)).toHaveLength(5);
  });

  it('resolves metadata by code', () => {
    expect(getSourceMeta('FDA')?.name).toBe('Food & Drug Administration');
    expect(getSourceMeta('nope')).toBeUndefined();
  });

  it('returns a source hex, and a neutral grey for ALL/unknown', () => {
    expect(sourceColor('CPSC')).toBe('#0072B2');
    expect(sourceColor('ALL')).toBe('#64748b');
  });
});
