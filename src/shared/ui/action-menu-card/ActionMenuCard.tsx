import type { ReactNode } from 'react';
import { ActionMenuItemContent, ActionMenuLayout } from '@ww-bill/bill-ui';
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
  badge?: ReactNode;
}

export interface ActionMenuCardProps {
  'items': ActionMenuItem[];
  'columns'?: 3 | 4 | 5;
  'variant'?: 'card' | 'detail-shortcuts' | 'gradient-tiles' | 'mine-actions' | 'tiles';
  'className'?: string;
  'aria-label'?: string;
}

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
    <ActionMenuLayout label={ariaLabel} columns={columns} variant={variant} className={cn(className, hasScrollableDetailShortcuts && 'bill-action-menu--scrollable')}>
      {items.map((item) => {
        const tone = item.tone ?? 'blue';
        return (
          <button
            aria-disabled={item.ariaDisabled ?? item.disabled}
            className={cn(
              `bill-action-menu__item bill-action-menu__item--${variant} bill-action-menu__tone--${tone}`,
              'ww-action-menu-card__item flex min-w-0 flex-col items-center justify-center transition active:scale-95 disabled:opacity-45 motion-reduce:transform-none motion-reduce:transition-none',
              variant === 'card' && 'gap-[7px] px-1 py-2',
              isMineActions && 'h-14 gap-[5px] p-0',
              variant === 'tiles'
              && 'gap-[7px] rounded-[18px] border px-1 pb-[10px] pt-[13px]',
              isGradientTiles
              && 'h-[68px] w-[calc((100%_-_20px)/3)] min-w-[calc((100%_-_20px)/3)] snap-start gap-1.5 rounded-[var(--ww-radius-control)] px-2 pb-2 pt-3',
              isDetailShortcuts
              && cn(
                'min-h-[max(44px,var(--ww-component-summary-shortcut-height))] gap-[var(--ww-component-summary-shortcut-gap)] rounded-[var(--ww-radius-control)] border px-[6px] py-1',
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
            <ActionMenuItemContent badge={item.badge} icon={item.icon} label={item.label} tone={tone} variant={variant} />
          </button>
        );
      })}
    </ActionMenuLayout>
  );
}
