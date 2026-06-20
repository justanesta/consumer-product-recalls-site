import { describe, expect, it } from 'vitest';
import { htmlToText } from './html';

describe('htmlToText', () => {
  it('strips USDA-style HTML markup into clean paragraphs', () => {
    const html =
      '<p><strong>WASHINGTON, June 18, 2026</strong> &ndash; Power Plate Meals, LLC is recalling&nbsp;product.</p>' +
      '<p>See <a href="https://x">https://x</a> for details.</p>';
    expect(htmlToText(html)).toBe(
      'WASHINGTON, June 18, 2026 – Power Plate Meals, LLC is recalling product.\n' +
        'See https://x for details.',
    );
  });

  it('passes plain text through (entity-decoded, whitespace-normalized)', () => {
    expect(htmlToText('Toys &amp; games   are   affected.')).toBe('Toys & games are affected.');
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(htmlToText(null)).toBe('');
    expect(htmlToText(undefined)).toBe('');
    expect(htmlToText('')).toBe('');
  });
});
