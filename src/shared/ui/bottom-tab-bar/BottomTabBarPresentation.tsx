import type { FC, KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface BottomTabBarItem {
  activeIcon?: ReactNode;
  disabled?: boolean;
  icon: ReactNode;
  key: string;
  label: ReactNode;
  onPrefetch?: () => void;
  onSelect: () => void;
  prominent?: boolean;
  route?: string;
}

interface BottomTabBarPresentationProps {
  activeKey: string;
  ariaLabel: string;
  items: readonly BottomTabBarItem[];
}

function handleArrowKey(event: KeyboardEvent<HTMLButtonElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
    return;
  const tabList = event.currentTarget.closest<HTMLElement>('[role="tablist"]');
  const tabs = Array.from(tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
  const index = tabs.indexOf(event.currentTarget);
  if (index < 0 || tabs.length === 0)
    return;
  event.preventDefault();
  if (event.key === 'Home') {
    tabs[0]?.focus();
    return;
  }
  if (event.key === 'End') {
    tabs.at(-1)?.focus();
    return;
  }
  const offset = event.key === 'ArrowRight' ? 1 : -1;
  tabs[(index + offset + tabs.length) % tabs.length]?.focus();
}

export const BottomTabBarPresentation: FC<BottomTabBarPresentationProps> = ({
  activeKey,
  ariaLabel,
  items,
}) => (
  <nav
    aria-label={ariaLabel}
    className="bwm-tab-bar ww-ledger-workspace-tab-bar ww-tab-bar fixed bottom-[calc(8px+env(safe-area-inset-bottom))] left-[var(--ww-page-gutter)] right-[var(--ww-page-gutter)] z-[100] flex h-[60px] items-center justify-evenly rounded-[30px] border border-border-primary bg-ww-surface px-[5px] text-ww-ghost shadow-ww-floating backdrop-blur-[var(--ww-card-blur)]"
    role="tablist"
  >
    {items.map((item) => {
      const isActive = item.key === activeKey;
      return (
        <button
          aria-disabled={item.disabled}
          aria-selected={isActive}
          className={cn(
            'item ww-tab-bar__button relative flex h-11 min-w-0 flex-1 flex-col items-center justify-center gap-[2px] rounded-[10px] border-0 bg-transparent px-1 text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep',
            isActive && 'text-primary-deep',
            item.disabled && 'opacity-45',
          )}
          data-prefetch-key={item.key}
          data-route={item.route}
          data-tab-key={item.key}
          key={item.key}
          onClick={() => {
            if (!isActive)
              item.onSelect();
          }}
          onFocus={item.disabled ? undefined : item.onPrefetch}
          onKeyDown={handleArrowKey}
          onMouseEnter={item.disabled ? undefined : item.onPrefetch}
          onTouchStart={item.disabled ? undefined : item.onPrefetch}
          role="tab"
          tabIndex={isActive ? 0 : -1}
          type="button"
        >
          <span
            className={cn(
              'ww-tab-bar__button-icon tab-icon flex h-[19px] w-[19px] items-center justify-center text-[19px] transition-transform',
              item.prominent
              && 'ww-tab-bar__create-icon absolute bottom-[12px] h-12 w-12 rounded-3xl text-[21px] text-white shadow-ww-xs',
            )}
          >
            {isActive ? item.activeIcon ?? item.icon : item.icon}
          </span>
          <span className={cn(
            'name ww-tab-bar__button-label max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[9.5px] font-medium leading-[14.25px] tracking-[0.3px]',
            isActive && 'font-bold',
            item.prominent && 'invisible',
          )}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </nav>
);
