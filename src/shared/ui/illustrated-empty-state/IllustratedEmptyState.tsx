import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface IllustratedEmptyStateProps {
  actionLabel?: ReactNode;
  accentIcon?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon: ReactNode;
  onAction?: () => void;
  testId?: string;
  title: ReactNode;
}

export function IllustratedEmptyState({
  actionLabel,
  accentIcon,
  className,
  description,
  icon,
  onAction,
  testId,
  title,
}: IllustratedEmptyStateProps) {
  return (
    <div
      className={cn('flex min-h-[300px] flex-col items-center justify-center px-6 py-8 text-center', className)}
      data-testid={testId}
    >
      <div aria-hidden="true" className="relative mb-5 h-[116px] w-[132px] shrink-0">
        <div className="absolute left-1/2 top-1/2 h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-light/45" />
        <div className="absolute left-[22px] top-[14px] flex h-[88px] w-[88px] items-center justify-center rounded-[20px] border border-white/70 bg-white/90 shadow-ww-lg">
          {icon}
        </div>
        {accentIcon && (
          <div className="absolute bottom-[3px] right-[7px] flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-ww">
            {accentIcon}
          </div>
        )}
        <span className="absolute left-[8px] top-[11px] h-2 w-2 rounded-full bg-ww-pink/80" />
        <span className="absolute right-[3px] top-[28px] h-1.5 w-1.5 rounded-full bg-primary-mid/70" />
      </div>

      <h2 className="text-[17px] font-extrabold leading-6 text-ww-ink">{title}</h2>
      {description && <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-ww-mid">{description}</p>}
      {actionLabel && onAction && (
        <button
          className="mt-5 min-h-11 rounded-full border-0 bg-primary px-6 text-[14px] font-bold text-white shadow-ww-xs transition active:bg-primary-mid"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
