import type { MotionValue } from 'motion/react';
import type { FC, KeyboardEvent, ReactNode } from 'react';
import { BottomNavigation, NavigationItemVisual } from '@ww-bill/bill-ui';
import { animate, AnimatePresence, m, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/shared/lib';
import { useMotionPreference } from '@/shared/ui/motion';

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
  indicatorProgress?: MotionValue<number>;
  indicatorStretch?: MotionValue<number>;
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
  indicatorProgress,
  indicatorStretch,
  items,
}) => {
  const { isMotionEnabled } = useMotionPreference();
  const activeIndex = items.findIndex(item => item.key === activeKey && !item.prominent);
  const internalIndicatorProgress = useMotionValue(Math.max(0, activeIndex));
  const internalIndicatorStretch = useMotionValue(1);
  const resolvedIndicatorProgress = indicatorProgress ?? internalIndicatorProgress;
  const resolvedIndicatorStretch = indicatorStretch ?? internalIndicatorStretch;
  const tabListRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const indicatorStepRef = useRef(0);

  const updateIndicatorTransform = useCallback(() => {
    if (!indicatorRef.current)
      return;
    const x = resolvedIndicatorProgress.get() * indicatorStepRef.current;
    const scaleX = resolvedIndicatorStretch.get();
    indicatorRef.current.style.transform = `translate3d(${x}px, 0, 0) scaleX(${scaleX})`;
  }, [resolvedIndicatorProgress, resolvedIndicatorStretch]);

  useLayoutEffect(() => {
    const updateStep = () => {
      const tabListWidth = tabListRef.current?.clientWidth ?? 0;
      indicatorStepRef.current = Math.max(0, tabListWidth - 10) / Math.max(1, items.length);
      updateIndicatorTransform();
    };
    updateStep();
    window.addEventListener('resize', updateStep);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateStep);
    if (observer && tabListRef.current)
      observer.observe(tabListRef.current);
    return () => {
      window.removeEventListener('resize', updateStep);
      observer?.disconnect();
    };
  }, [items.length, updateIndicatorTransform]);

  useMotionValueEvent(resolvedIndicatorProgress, 'change', updateIndicatorTransform);
  useMotionValueEvent(resolvedIndicatorStretch, 'change', updateIndicatorTransform);

  useEffect(() => {
    if (indicatorProgress)
      return;
    internalIndicatorProgress.stop();
    if (!isMotionEnabled) {
      internalIndicatorProgress.set(Math.max(0, activeIndex));
      return;
    }
    animate(internalIndicatorProgress, Math.max(0, activeIndex), {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    });
  }, [activeIndex, indicatorProgress, internalIndicatorProgress, isMotionEnabled]);

  return (
    <BottomNavigation
      activeIndex={activeIndex}
      ariaLabel={ariaLabel}
      isMotionEnabled={isMotionEnabled}
      itemCount={items.length}
      rootRef={tabListRef}
      indicator={(
        <span
          aria-hidden="true"
          className="ww-floating-dock__active-indicator"
          ref={indicatorRef}
          style={{ opacity: activeIndex >= 0 ? 1 : 0, transition: 'none' }}
        />
      )}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            aria-disabled={item.disabled}
            aria-selected={isActive}
            className={cn(
              'item ww-tab-bar__button ww-floating-dock__button relative flex h-11 min-w-0 flex-1 flex-col items-center justify-center gap-[2px] rounded-[18px] border-0 bg-transparent px-1 text-inherit focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep',
              isMotionEnabled && 'transition-[background,color,transform] duration-200 ease-out active:scale-[0.97]',
              isActive && 'ww-floating-dock__button--active',
              item.prominent && 'ww-floating-dock__button--prominent',
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
            <NavigationItemVisual
              isActive={isActive}
              isMotionEnabled={isMotionEnabled}
              label={item.label}
              prominent={item.prominent}
              icon={(
                <AnimatePresence initial={false} mode="sync">
                  <m.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    exit={isMotionEnabled ? { opacity: 0, scale: 0.92 } : undefined}
                    initial={isMotionEnabled ? { opacity: 0, scale: 0.92 } : false}
                    key={isActive ? 'active' : 'inactive'}
                    transition={isMotionEnabled ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                  >
                    {isActive ? item.activeIcon ?? item.icon : item.icon}
                  </m.span>
                </AnimatePresence>
              )}
            />
          </button>
        );
      })}
    </BottomNavigation>
  );
};
