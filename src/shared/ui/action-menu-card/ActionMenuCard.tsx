import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

export type ActionMenuTone = 'blue' | 'pink' | 'purple' | 'green' | 'amber';

export interface ActionMenuItem {
  ariaDisabled?: boolean;
  key: string;
  label: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: ActionMenuTone;
  testId?: string;
}

export interface ActionMenuCardProps {
  'items': ActionMenuItem[];
  'columns'?: 3 | 4 | 5;
  'variant'?: 'card' | 'detail-shortcuts' | 'gradient-tiles' | 'mine-actions' | 'tiles';
  'className'?: string;
  'aria-label'?: string;
}

const columnClassNames = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function ActionMenuCard({
  items,
  columns = 4,
  variant = 'card',
  className = '',
  'aria-label': ariaLabel,
}: ActionMenuCardProps) {
  const isGradientTiles = variant === 'gradient-tiles';
  const isDetailShortcuts = variant === 'detail-shortcuts';
  const hasScrollableDetailShortcuts = isDetailShortcuts && items.length > 5;
  const isMineActions = variant === 'mine-actions';
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        'ww-action-menu-card',
        isDetailShortcuts
          ? cn(
              'flex gap-[10px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              hasScrollableDetailShortcuts && 'snap-x snap-mandatory',
            )
          : isGradientTiles
            ? 'flex snap-x gap-[10px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : `grid ${columnClassNames[columns]} ${isMineActions ? 'gap-1' : 'gap-2'}`,
        variant === 'card'
        && 'rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface-raised px-[10px] py-3',
        isMineActions
        && 'rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface-raised px-[10px] py-3',
        className,
      )}
      role="group"
    >
      {items.map((item) => {
        const tone = item.tone ?? 'blue';
        return (
          <button
            aria-disabled={item.ariaDisabled ?? item.disabled}
            className={cn(
              'ww-action-menu-card__item flex min-w-0 flex-col items-center justify-center transition active:scale-95 disabled:opacity-45',
              variant === 'card' && 'gap-[7px] px-1 py-2',
              isMineActions && 'h-16 gap-[5px] px-1 py-1.5',
              variant === 'tiles'
              && 'gap-[7px] rounded-[18px] border px-1 pb-[10px] pt-[13px]',
              isGradientTiles
              && 'h-[68px] w-[calc((100%_-_20px)/3)] min-w-[calc((100%_-_20px)/3)] snap-start gap-1.5 rounded-[var(--ww-radius-control)] px-2 pb-2 pt-3',
              isDetailShortcuts
              && cn(
                'h-16 gap-[5px] rounded-[14px] border px-[6px] py-2',
                hasScrollableDetailShortcuts
                  ? 'w-[calc((100%_-_30px)/4)] min-w-[calc((100%_-_30px)/4)] flex-none snap-start'
                  : 'min-w-0 flex-1',
              ),
              item.ariaDisabled && 'opacity-45',
            )}
            data-action-menu-tone={tone}
            data-action-menu-variant={variant}
            disabled={item.disabled}
            data-testid={item.testId}
            key={item.key}
            onClick={item.onClick}
            type="button"
          >
            <span
              className={cn(
                'flex items-center justify-center',
                isDetailShortcuts
                  ? 'h-5 w-5 bg-transparent text-[20px]'
                  : isGradientTiles
                    ? 'h-[22px] w-[22px] bg-transparent text-[22px]'
                    : variant === 'tiles'
                      ? 'h-11 w-11 rounded-full text-xl'
                      : 'h-9 w-9 rounded-full text-base',
                !isGradientTiles && !isDetailShortcuts && 'ww-action-menu-card__icon',
              )}
              data-action-menu-tone={tone}
              data-action-menu-variant={variant}
            >
              {item.icon}
            </span>
            <span className={cn(
              'w-full truncate text-center font-semibold',
              isDetailShortcuts || isGradientTiles ? 'text-[11px] font-bold leading-[16.5px]' : 'text-[10px] font-semibold leading-[15px] text-ww-ink',
            )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
