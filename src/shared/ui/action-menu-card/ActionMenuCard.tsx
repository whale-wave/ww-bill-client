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
  'variant'?: 'card' | 'gradient-tiles' | 'tiles';
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
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        isGradientTiles
          ? 'flex snap-x gap-[10px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : `grid ${columnClassNames[columns]} gap-2`,
        variant === 'card'
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
              variant === 'tiles'
              && 'gap-[7px] rounded-[18px] border border-border-primary bg-white/80 px-1 pb-[10px] pt-[13px] shadow-ww-xs',
              isGradientTiles
              && `h-[75px] w-[calc((100%_-_20px)/3)] min-w-[calc((100%_-_20px)/3)] snap-start gap-2 rounded-[16px] px-2 pb-3 pt-4 ${tileToneClassNames[tone]}`,
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
                isGradientTiles
                  ? 'h-[22px] w-[22px] bg-transparent text-[22px]'
                  : variant === 'tiles'
                    ? 'h-11 w-11 rounded-full text-xl'
                    : 'h-9 w-9 rounded-full text-base',
                !isGradientTiles && iconToneClassNames[tone],
              )}
            >
              {item.icon}
            </span>
            <span className={cn(
              'w-full truncate text-center font-semibold',
              isGradientTiles ? 'text-[11px] leading-[16.5px]' : 'text-[10px] leading-[15px] text-ww-ink',
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
