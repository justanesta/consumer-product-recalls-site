export type StatusTone = 'active' | 'inactive' | 'unknown';

export interface StatusMeta {
  tone: StatusTone;
  label: string;
  /** Honest description of the tri-state. */
  hint: string;
}

/**
 * Resolve the tri-state `is_active` into a display status.
 *
 * `is_active` is null for CPSC/NHTSA — they carry no lifecycle, so the honest
 * third state is "no lifecycle", NOT a false "Inactive".
 */
export function recallStatus(isActive?: boolean | null): StatusMeta {
  if (isActive === true) {
    return { tone: 'active', label: 'Active', hint: 'Recall is currently active.' };
  }
  if (isActive === false) {
    return { tone: 'inactive', label: 'Inactive', hint: 'Recall has been closed/terminated.' };
  }
  return {
    tone: 'unknown',
    label: 'No lifecycle',
    hint: 'This source (CPSC/NHTSA) does not track an active/inactive lifecycle.',
  };
}
