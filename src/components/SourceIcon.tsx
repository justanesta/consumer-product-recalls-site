import { sourceColor } from '@/lib/domain/sources';
import { cn } from '@/lib/utils/cn';

/**
 * Monochrome category glyph per source, tinted to the source's colorblind-safe
 * color. Neutral icons (not official agency seals) — they encode what the agency
 * recalls (FDA→capsule, NHTSA→vehicle, USDA→poultry, USCG→anchor/boat,
 * CPSC→package), so there's no endorsement/seal-usage question. Decorative: the
 * label/`title` on the surrounding badge carries the meaning.
 */
const PATHS: Record<string, React.ReactNode> = {
  // FDA — food/drugs/devices: a capsule with a center split.
  FDA: (
    <>
      <rect x="4" y="8.5" width="16" height="7" rx="3.5" />
      <line x1="12" y1="8.5" x2="12" y2="15.5" />
    </>
  ),
  // NHTSA — vehicles: a side-view car.
  NHTSA: (
    <>
      <path d="M4.5 13l1.4-3.3A2.2 2.2 0 0 1 8 8.3h8a2.2 2.2 0 0 1 2.1 1.4L19.5 13" />
      <rect x="3" y="13" width="18" height="4.2" rx="1.4" />
      <circle cx="7.5" cy="17.2" r="1.7" />
      <circle cx="16.5" cy="17.2" r="1.7" />
    </>
  ),
  // USDA (FSIS) — meat & poultry: a drumstick (meat blob + knobbed bone).
  USDA: (
    <>
      <path d="M15.45 15.4c-2.13.65-4.3.32-5.7-1.1-2.29-2.27-1.76-6.5 1.17-9.42 2.93-2.93 7.15-3.46 9.42-1.17 1.42 1.41 1.74 3.57 1.1 5.71-1.4-.51-3.26-.02-4.64 1.36-1.38 1.38-1.87 3.23-1.35 4.62z" />
      <path d="M11.25 15.6l-2.16 2.16a2.5 2.5 0 1 1-4.56 1.73 2.49 2.49 0 0 1 1.41-2.61" />
    </>
  ),
  // USCG — recreational boats: an anchor.
  USCG: (
    <>
      <circle cx="12" cy="5" r="1.7" />
      <line x1="12" y1="6.7" x2="12" y2="19.5" />
      <line x1="8.5" y1="9.5" x2="15.5" y2="9.5" />
      <path d="M5 13.5a7 7 0 0 0 14 0" />
    </>
  ),
  // CPSC — consumer products: a package/box.
  CPSC: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M4 7.5l8 4.5 8-4.5" />
      <line x1="12" y1="12" x2="12" y2="21" />
    </>
  ),
};

export interface SourceIconProps {
  source: string;
  className?: string;
}

export default function SourceIcon({ source, className }: SourceIconProps) {
  const path = PATHS[source];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4 shrink-0', className)}
      style={{ color: sourceColor(source) }}
      aria-hidden="true"
    >
      {path ?? <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />}
    </svg>
  );
}
