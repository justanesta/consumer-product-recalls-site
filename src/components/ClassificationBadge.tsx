import {
  classificationHint,
  classificationTone,
  type SeverityTone,
} from '@/lib/domain/classification';
import { cn } from '@/lib/utils/cn';

const TONE_CLASSES: Record<SeverityTone, string> = {
  high: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-400/20',
  medium:
    'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20',
  low: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20',
  info: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20',
  none: '',
};

export interface ClassificationBadgeProps {
  source: string;
  classification?: string | null;
  riskLevel?: string | null;
  className?: string;
}

/** Source-native classification, severity-tinted (the raw label carries the meaning). */
export default function ClassificationBadge({
  source,
  classification,
  riskLevel,
  className,
}: ClassificationBadgeProps) {
  if (!classification) {
    return (
      <span
        className={cn('text-xs text-muted', className)}
        title="No classification for this source"
      >
        —
      </span>
    );
  }
  const tone = classificationTone(source, classification);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
      title={classificationHint(source, classification)}
    >
      {classification}
      {riskLevel && riskLevel !== classification ? ` · ${riskLevel}` : ''}
    </span>
  );
}
