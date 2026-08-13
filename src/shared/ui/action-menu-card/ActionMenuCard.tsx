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

const iconToneClassNames: Record<ActionMenuTone, string> = {
  amber: 'bg-[#fff0c8] text-[#b77d20]',
  blue: 'bg-[#c8eaf6] text-primary-deep',
  green: 'bg-[#dcf4ea] text-[#3e9e7b]',
  pink: 'bg-[#ffd8e6] text-[#c05070]',
  purple: 'bg-[#e8e2ff] text-[#705cc0]',
};

const tileToneClassNames: Record<ActionMenuTone, string> = {
  amber: 'bg-[linear-gradient(144.802deg,#fff0c8_0%,#fff7e3_100%)] text-[#b77d20] shadow-[0_4px_7px_rgba(183,125,32,0.14)]',
  blue: 'bg-[linear-gradient(144.806deg,#c8eaf6_0%,#d8f0ff_100%)] text-primary-deep shadow-[0_4px_7px_rgba(60,140,180,0.14)]',
  green: 'bg-[linear-gradient(144.802deg,#dcf4ea_0%,#ecfaf5_100%)] text-[#3e9e7b] shadow-[0_4px_7px_rgba(62,158,123,0.14)]',
  pink: 'bg-[linear-gradient(144.802deg,#ffd8e6_0%,#ffe8f2_100%)] text-[#c05070] shadow-[0_4px_7px_rgba(200,80,112,0.14)]',
  purple: 'bg-[linear-gradient(144.802deg,#ddd8ff_0%,#ede8ff_100%)] text-[#705cc0] shadow-[0_4px_7px_rgba(96,80,184,0.14)]',
};

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
  const hasScrollableDetailShortcuts = isDetailShortcuts && items.length > 3;
  const isMineActions = variant === 'mine-actions';
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        isDetailShortcuts
          ? cn(
              'flex gap-[10px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              hasScrollableDetailShortcuts && 'snap-x snap-mandatory',
            )
          : isGradientTiles
            ? 'flex snap-x gap-[10px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : `grid ${columnClassNames[columns]} ${isMineActions ? 'gap-1' : 'gap-2'}`,
        variant === 'card'
        && 'rounded-[18px] border border-border-primary bg-white/[0.82] px-[10px] py-[14px] shadow-ww-xs backdrop-blur-xl',
        isMineActions
        && 'rounded-[18px] border border-border-primary bg-white/[0.82] px-[10px] py-[14px] shadow-ww-xs backdrop-blur-xl',
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
              'flex min-w-0 flex-col items-center justify-center transition active:scale-95 disabled:opacity-45',
              variant === 'card' && 'gap-[7px] px-1 py-2',
              isMineActions && 'h-[74px] gap-[7px] px-1 py-2',
              variant === 'tiles'
              && 'gap-[7px] rounded-[18px] border border-border-primary bg-white/80 px-1 pb-[10px] pt-[13px] shadow-ww-xs',
              isGradientTiles
              && `h-[75px] w-[calc((100%_-_20px)/3)] min-w-[calc((100%_-_20px)/3)] snap-start gap-2 rounded-[16px] px-2 pb-3 pt-4 ${tileToneClassNames[tone]}`,
              isDetailShortcuts
              && cn(
                'h-[70px] gap-[7px] rounded-[14px] border border-white/90 px-[6px] py-3',
                hasScrollableDetailShortcuts
                  ? 'w-[calc((100%_-_30px)/4)] min-w-[calc((100%_-_30px)/4)] flex-none snap-start'
                  : 'min-w-0 flex-1',
                tone === 'pink'
                  ? 'bg-[linear-gradient(142.431deg,#fff_0%,#ffe8f2_100%)] text-[#c05070] shadow-[0_3px_6px_rgba(200,80,112,0.14)]'
                  : tone === 'purple'
                    ? 'bg-[linear-gradient(142.431deg,#fff_0%,#ede8ff_100%)] text-[#6050b8] shadow-[0_3px_6px_rgba(96,80,184,0.14)]'
                    : 'bg-[linear-gradient(142.431deg,#fff_0%,#e8f6ff_100%)] text-[#2b8baa] shadow-[0_3px_6px_rgba(74,170,200,0.18)]',
              ),
              item.ariaDisabled && 'opacity-45',
            )}
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
                !isGradientTiles && !isDetailShortcuts && iconToneClassNames[tone],
              )}
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
