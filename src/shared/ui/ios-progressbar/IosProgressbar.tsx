import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib';
import './ios-progressbar.scss';

export interface IosProgressbarProps {
  ariaLabel?: string;
  className?: string;
  color?: string;
  percent: number;
}

/** Percent is a fraction in [0, 1], matching the existing product ProgressBar API. */
export function IosProgressbar({ ariaLabel, className, color, percent }: IosProgressbarProps) {
  const value = Number.isFinite(percent) ? Math.max(0, Math.min(1, percent)) : 0;
  return (
    <span
      aria-label={ariaLabel}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(value * 100)}
      className={cn('ww-ios-progressbar block h-1.5 min-w-0 overflow-hidden rounded-full', className)}
      role="progressbar"
    >
      <span
        className="ww-ios-progressbar__fill block h-full w-full rounded-full"
        style={{ background: color, transform: `translateX(-${100 - value * 100}%)` } as CSSProperties}
      />
    </span>
  );
}
