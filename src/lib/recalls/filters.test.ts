import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  filtersToQuery,
  filtersToSearchParams,
  hasActiveFilters,
  isSearchMode,
  searchParamsToFilters,
  type RecallFilters,
} from './filters';

const sample: RecallFilters = {
  q: 'toaster',
  source: ['CPSC', 'FDA'],
  classification: ['2'],
  status: 'active',
  distribution_scope: ['Nationwide'],
  published_after: '2025-01-01',
  published_before: '2025-12-31',
  firm: 'Acme',
};

describe('filters URL round-trip', () => {
  it('serializes and parses back to the same filters', () => {
    const params = filtersToSearchParams(sample);
    expect(params.get('source')).toBe('CPSC,FDA');
    expect(params.get('status')).toBe('active');
    expect(searchParamsToFilters(params)).toEqual(sample);
  });

  it('drops unknown enum values on parse', () => {
    const params = new URLSearchParams('source=CPSC,BOGUS&scope=Nationwide,FAKE');
    const f = searchParamsToFilters(params);
    expect(f.source).toEqual(['CPSC']);
    expect(f.distribution_scope).toEqual(['Nationwide']);
  });

  it('empty filters serialize to an empty querystring', () => {
    expect(filtersToSearchParams(EMPTY_FILTERS).toString()).toBe('');
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });
});

describe('filtersToQuery', () => {
  it('maps status to is_active and carries limit/cursor', () => {
    const q = filtersToQuery(sample, { limit: 25, cursor: 'abc' });
    expect(q).toMatchObject({
      limit: 25,
      cursor: 'abc',
      q: 'toaster',
      source: ['CPSC', 'FDA'],
      classification: ['2'],
      is_active: true,
      distribution_scope: ['Nationwide'],
      published_after: '2025-01-01',
      firm: 'Acme',
    });
  });

  it('omits is_active for status "any" and emits only limit when empty', () => {
    expect(filtersToQuery({ ...EMPTY_FILTERS }, { limit: 25 })).toEqual({ limit: 25 });
    expect(filtersToQuery({ ...EMPTY_FILTERS, status: 'inactive' }, { limit: 10 })).toEqual({
      limit: 10,
      is_active: false,
    });
  });

  it('detects search mode from a non-empty q', () => {
    expect(isSearchMode(sample)).toBe(true);
    expect(isSearchMode(EMPTY_FILTERS)).toBe(false);
  });
});
