import { describe, expect, it } from 'vitest';
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatMonth,
  formatNumber,
  recallsLabel,
} from './format';

describe('formatNumber', () => {
  it('thousands-separates and dashes nulls', () => {
    expect(formatNumber(93444)).toBe('93,444');
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
  });
});

describe('formatCompact', () => {
  it('keeps small numbers full and compacts large ones', () => {
    expect(formatCompact(9999)).toBe('9,999');
    expect(formatCompact(93444)).toBe('93.4K');
    expect(formatCompact(null)).toBe('—');
  });
});

describe('formatDate / formatDateTime', () => {
  it('formats ISO timestamps in UTC and dashes invalid', () => {
    expect(formatDate('2026-06-19T04:32:02Z')).toBe('Jun 19, 2026');
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDateTime('2026-06-19T04:32:02Z')).toBe('Jun 19, 2026, 04:32 UTC');
  });
});

describe('formatMonth', () => {
  it('formats a date to a UTC month label and dashes invalid', () => {
    expect(formatMonth('2018-09-01')).toBe('Sep 2018');
    expect(formatMonth('2026-06-19T04:32:02Z')).toBe('Jun 2026');
    expect(formatMonth(null)).toBe('—');
    expect(formatMonth('nope')).toBe('—');
  });
});

describe('recallsLabel', () => {
  it('pluralizes and thousands-separates', () => {
    expect(recallsLabel(1)).toBe('1 recall');
    expect(recallsLabel(0)).toBe('0 recalls');
    expect(recallsLabel(93444)).toBe('93,444 recalls');
  });
});
