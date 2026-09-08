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
  variant?: 'default' | 'quiet';
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
  variant = 'default',
}: IllustratedEmptyStateProps) {
  const isQuiet = variant === 'quiet';

  return (
    <div
      className={cn('flex min-h-[300px] flex-col items-center justify-center px-6 py-8 text-center', className)}
      data-empty-state-variant={variant}
      data-testid={testId}
    >
      <div
        aria-hidden="true"
        className={cn(
          'relative shrink-0',
          isQuiet ? 'mb-3 h-20 w-20' : 'mb-5 h-[116px] w-[132px]',
        )}
      >
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            isQuiet
              ? 'h-20 w-20 rounded-[20px] bg-primary-light/35'
              : 'h-[108px] w-[108px] rounded-full bg-primary-light/45',
          )}
        />
        <div
          className={cn(
            'absolute flex items-center justify-center',
            isQuiet
              ? 'left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-solid border-primary/15 bg-ww-surface-raised'
              : 'left-[22px] top-[14px] h-[88px] w-[88px] rounded-[20px] border border-white/70 bg-white/90 shadow-ww-lg',
          )}
        >
          {icon}
        </div>
        {accentIcon && (
          <div className="absolute bottom-[3px] right-[7px] flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-ww">
            {accentIcon}
          </div>
        )}
        {!isQuiet && (
          <>
            <span className="absolute left-[8px] top-[11px] h-2 w-2 rounded-full bg-ww-pink/80" data-empty-state-decoration />
            <span className="absolute right-[3px] top-[28px] h-1.5 w-1.5 rounded-full bg-primary-mid/70" data-empty-state-decoration />
          </>
        )}
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
