import type { CSSProperties, ElementType, ReactNode, Ref } from 'react';
import './bottom-navigation.scss';

export interface BottomNavigationProps<Element = unknown> {
  activeIndex: number;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  indicator?: ReactNode;
  indicatorPrimitive?: ElementType;
  isMotionEnabled?: boolean;
  itemCount: number;
  primitive?: ElementType;
  rootRef?: Ref<Element>;
}

/** The host supplies interactive items and owns route state and animation. */
export function BottomNavigation<Element = unknown>({ activeIndex, ariaLabel, children, className, indicator, indicatorPrimitive: Indicator = 'span', isMotionEnabled = false, itemCount, primitive: Root = 'nav', rootRef }: BottomNavigationProps<Element>) {
  return (
    <Root
      aria-label={ariaLabel}
      className={`bill-navigation bwm-tab-bar ww-ledger-workspace-tab-bar ww-tab-bar ww-floating-dock fixed bottom-[calc(10px+var(--ww-safe-area-bottom))] left-[14px] right-[14px] z-[100] flex h-[68px] items-center justify-evenly rounded-[34px] px-[5px] text-ww-ghost${className ? ` ${className}` : ''}`}
      data-active-index={activeIndex >= 0 ? activeIndex : undefined}
      data-motion-enabled={isMotionEnabled}
      ref={rootRef}
      role="tablist"
      style={{ '--ww-tab-count': itemCount } as CSSProperties}
    >
      {indicator ?? <Indicator aria-hidden="true" className="ww-floating-dock__active-indicator" style={{ opacity: activeIndex >= 0 ? 1 : 0, transform: `translateX(${Math.max(0, activeIndex) * 100}%)` }} />}
      {children}
    </Root>
  );
}

export interface NavigationItemVisualProps {
  icon: ReactNode;
  isActive?: boolean;
  isMotionEnabled?: boolean;
  label: ReactNode;
  primitive?: ElementType;
  prominent?: boolean;
}

export function NavigationItemVisual({ icon, isActive = false, isMotionEnabled = false, label, primitive: Box = 'span', prominent = false }: NavigationItemVisualProps) {
  return (
    <>
      <Box className={`bill-navigation__icon ww-tab-bar__button-icon tab-icon relative flex h-[19px] w-[19px] shrink-0 items-center justify-center text-[19px]${isMotionEnabled ? ' transition-transform duration-200 ease-out' : ''}${prominent ? ' ww-tab-bar__create-icon ww-floating-dock__create absolute bottom-[13px] h-14 w-14 rounded-full text-[22px] text-white' : ''}`}>
        {icon}
      </Box>
      <Box className={`bill-navigation__label name ww-tab-bar__button-label max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[9.5px] font-medium leading-[14.25px] tracking-[0.3px]${isActive ? ' font-bold' : ''}${prominent ? ' invisible' : ''}`}>
        {label}
      </Box>
    </>
  );
}
