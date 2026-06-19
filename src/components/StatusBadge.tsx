import { recallStatus, type StatusTone } from '@/lib/domain/status';
import { cn } from '@/lib/utils/cn';

const TONE: Record<StatusTone, { text: string; dot: string }> = {
  active: { text: 'text-status-active', dot: 'bg-status-active' },
  inactive: { text: 'text-status-inactive', dot: 'bg-status-inactive' },
  unknown: { text: 'text-muted', dot: 'bg-status-unknown' },
};

export interface StatusBadgeProps {
  isActive?: boolean | null;
  className?: string;
}

/** Tri-state recall status (Active / Inactive / No lifecycle for CPSC & NHTSA). */
export default function StatusBadge({ isActive, className }: StatusBadgeProps) {
  const status = recallStatus(isActive);
  const tone = TONE[status.tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs font-medium',
        tone.text,
        className,
      )}
      title={status.hint}
    >
      <span className={cn('h-2 w-2 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
      {status.label}
    </span>
  );
}
