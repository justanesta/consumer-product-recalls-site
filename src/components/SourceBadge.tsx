import SourceIcon from '@/components/SourceIcon';
import { getSourceMeta } from '@/lib/domain/sources';
import { cn } from '@/lib/utils/cn';

export interface SourceBadgeProps {
  source: string;
  full?: boolean;
  className?: string;
}

/** Source pill: a category glyph tinted to the source color (the colored element) + the code/name. */
export default function SourceBadge({ source, full = false, className }: SourceBadgeProps) {
  const meta = getSourceMeta(source);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-xs font-medium text-ink',
        className,
      )}
      title={meta?.name ?? source}
    >
      <SourceIcon source={source} className="h-3.5 w-3.5" />
      {full ? (meta?.name ?? source) : (meta?.label ?? source)}
    </span>
  );
}
