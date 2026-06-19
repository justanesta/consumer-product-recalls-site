import { getSourceMeta } from '@/lib/domain/sources';
import { cn } from '@/lib/utils/cn';

export interface SourceBadgeProps {
  source: string;
  full?: boolean;
  className?: string;
}

/** Source pill: a fixed-color dot (the only colored element, for contrast) + the code/name. */
export default function SourceBadge({ source, full = false, className }: SourceBadgeProps) {
  const meta = getSourceMeta(source);
  const hex = meta?.hex ?? '#64748b';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-xs font-medium text-ink',
        className,
      )}
      title={meta?.name ?? source}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: hex }}
        aria-hidden="true"
      />
      {full ? (meta?.name ?? source) : (meta?.label ?? source)}
    </span>
  );
}
