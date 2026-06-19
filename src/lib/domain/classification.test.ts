import { describe, expect, it } from 'vitest';
import { classificationHint, classificationTone } from './classification';

describe('classificationTone', () => {
  it('maps FDA numeric classes', () => {
    expect(classificationTone('FDA', '1')).toBe('high');
    expect(classificationTone('FDA', '2')).toBe('medium');
    expect(classificationTone('FDA', '3')).toBe('low');
    expect(classificationTone('FDA', 'NC')).toBe('info');
  });

  it('maps USDA classes and Public Health Alert', () => {
    expect(classificationTone('USDA', 'Class I')).toBe('high');
    expect(classificationTone('USDA', 'Class III')).toBe('low');
    expect(classificationTone('USDA', 'Public Health Alert')).toBe('info');
  });

  it('maps USCG severity letters', () => {
    expect(classificationTone('USCG', 'H')).toBe('high');
    expect(classificationTone('USCG', 'L')).toBe('low');
  });

  it('returns none for empty and info for unknown sources', () => {
    expect(classificationTone('FDA', null)).toBe('none');
    expect(classificationTone('CPSC', 'anything')).toBe('info');
  });
});

describe('classificationHint', () => {
  it('expands FDA codes', () => {
    expect(classificationHint('FDA', '1')).toContain('most serious');
  });

  it('is undefined for empty', () => {
    expect(classificationHint('USDA', null)).toBeUndefined();
  });
});
