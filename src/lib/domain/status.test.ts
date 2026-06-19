import { describe, expect, it } from 'vitest';
import { recallStatus } from './status';

describe('recallStatus', () => {
  it('maps true/false to active/inactive', () => {
    expect(recallStatus(true).tone).toBe('active');
    expect(recallStatus(false).tone).toBe('inactive');
  });

  it('maps null/undefined to the honest "no lifecycle" state', () => {
    expect(recallStatus(null).tone).toBe('unknown');
    expect(recallStatus(null).label).toBe('No lifecycle');
    expect(recallStatus(undefined).tone).toBe('unknown');
  });
});
