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
  <div className="ww-tab-bar-spacer h-[calc(60px+env(safe-area-inset-bottom))] flex-none basis-[calc(60px+env(safe-area-inset-bottom))]">
    <nav
      aria-label={ariaLabel}
      className="bwm-tab-bar ww-ledger-workspace-tab-bar ww-tab-bar fixed inset-x-0 bottom-0 z-[100] flex h-[60px] items-center justify-evenly border-0 border-t border-solid border-[#f2f2f2] bg-[#fefefe] pb-[env(safe-area-inset-bottom)] text-[#747374] shadow-[0_-2px_8px_rgb(0_0_0/4%)]"
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            aria-disabled={item.disabled}
            aria-selected={isActive}
            className={cn(
              'item ww-tab-bar__button relative flex h-[60px] min-w-0 flex-1 flex-col items-center justify-end border-0 bg-transparent px-1 pb-1 text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ww-theme-text-color)]',
              isActive && 'text-[var(--ww-theme-text-color)]',
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
                'ww-tab-bar__button-icon tab-icon flex h-6 items-center justify-center text-[length:var(--ww-font-size-xl)]',
                item.prominent
                && 'ww-tab-bar__create-icon absolute bottom-[19px] h-[55px] w-[55px] rounded-full border-[5px] border-solid border-white bg-primary text-[var(--ww-theme-text-color)] shadow-[0_-2px_7px_rgb(0_0_0/8%)]',
              )}
            >
              {isActive ? item.activeIcon ?? item.icon : item.icon}
            </span>
            <span className="name ww-tab-bar__button-label mt-0.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--ww-font-size-sm)] font-semibold leading-[15px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  </div>
);
