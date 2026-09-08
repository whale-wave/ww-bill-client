import type { FC, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { PersonalTabKey } from '../model/personal-tabs';
import { animate, m, useMotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playSound } from '@/shared/lib';
import { useMotionPreference } from '@/shared/ui';
import { PERSONAL_SWIPE_TABS, PERSONAL_TABS } from '../model/personal-tabs';
import { PersonalTabBarOwnerContext } from './tab-bar/personal-tab-bar-context';
import { TabBar } from './tab-bar/tab-bar';

export interface PersonalTabSwipePage {
  content: ReactNode;
  key: Exclude<PersonalTabKey, 'bookkeeping'>;
}

interface PersonalTabSwipeNavigationProps {
  pages: readonly PersonalTabSwipePage[];
}

interface SwipeOrigin {
  axis: 'horizontal' | 'pending';
  pointerId: number;
  startedAt: number;
  trackX: number;
  x: number;
  y: number;
}

const SWIPE_IGNORE_SELECTOR = [
  '.adm-swipe-action',
  '.ww-tab-bar',
  '[data-record-calendar-swipe]',
  '[data-tab-swipe-ignore]',
  '[_echarts_instance_]',
  'canvas',
  'input',
  'select',
  'textarea',
].join(',');

const PAGE_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
} as const;

function shouldIgnoreSwipe(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(SWIPE_IGNORE_SELECTOR));
}

function getIndicatorIndex(pageIndex: number) {
  const tabKey = PERSONAL_SWIPE_TABS[pageIndex]?.key;
  return Math.max(0, PERSONAL_TABS.findIndex(tab => tab.key === tabKey));
}

function getViewportWidth(element: HTMLDivElement | null) {
  return element?.clientWidth
    || element?.getBoundingClientRect().width
    || document.documentElement.clientWidth
    || window.innerWidth
    || 320;
}

export const PersonalTabSwipeNavigation: FC<PersonalTabSwipeNavigationProps> = ({ pages }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMotionEnabled } = useMotionPreference();
  const activeIndex = PERSONAL_SWIPE_TABS.findIndex(tab => tab.route === location.pathname);
  const activeIndexRef = useRef(activeIndex);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportWidthRef = useRef(0);
  const swipeOriginRef = useRef<SwipeOrigin>();
  const suppressClickRef = useRef(false);
  const trackX = useMotionValue(0);
  const indicatorProgress = useMotionValue(getIndicatorIndex(activeIndex));
  const indicatorStretch = useMotionValue(1);

  useLayoutEffect(() => {
    const updateWidth = () => {
      const viewport = viewportRef.current;
      if (viewport)
        viewport.scrollLeft = 0;
      const width = getViewportWidth(viewport);
      viewportWidthRef.current = width;
      trackX.stop();
      trackX.set(-activeIndexRef.current * width);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateWidth);
    if (observer && viewportRef.current)
      observer.observe(viewportRef.current);
    return () => {
      window.removeEventListener('resize', updateWidth);
      observer?.disconnect();
    };
  }, [trackX]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    if (viewportRef.current)
      viewportRef.current.scrollLeft = 0;
    const targetX = -activeIndex * (viewportWidthRef.current || getViewportWidth(viewportRef.current));
    const targetIndicator = getIndicatorIndex(activeIndex);
    trackX.stop();
    indicatorProgress.stop();
    indicatorStretch.stop();
    if (!isMotionEnabled) {
      trackX.set(targetX);
      indicatorProgress.set(targetIndicator);
      indicatorStretch.set(1);
      return;
    }
    animate(trackX, targetX, PAGE_TRANSITION);
    animate(indicatorProgress, targetIndicator, PAGE_TRANSITION);
    animate(indicatorStretch, 1, { duration: 0.18, ease: [0.22, 1, 0.36, 1] });
  }, [activeIndex, indicatorProgress, indicatorStretch, isMotionEnabled, trackX]);

  if (activeIndex < 0)
    return null;

  const settleAtCurrentPage = () => {
    const width = viewportWidthRef.current || getViewportWidth(viewportRef.current);
    trackX.stop();
    indicatorProgress.stop();
    indicatorStretch.stop();
    if (!isMotionEnabled) {
      trackX.set(-activeIndex * width);
      indicatorProgress.set(getIndicatorIndex(activeIndex));
      indicatorStretch.set(1);
      return;
    }
    animate(trackX, -activeIndex * width, { duration: 0.18, ease: [0.22, 1, 0.36, 1] });
    animate(indicatorProgress, getIndicatorIndex(activeIndex), { duration: 0.18, ease: [0.22, 1, 0.36, 1] });
    animate(indicatorStretch, 1, { duration: 0.16, ease: [0.22, 1, 0.36, 1] });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeOriginRef.current = undefined;
    if (event.button !== 0
      || event.isPrimary === false
      || event.pointerType === 'mouse'
      || shouldIgnoreSwipe(event.target)) {
      return;
    }
    trackX.stop();
    indicatorProgress.stop();
    indicatorStretch.stop();
    swipeOriginRef.current = {
      axis: 'pending',
      pointerId: event.pointerId,
      startedAt: performance.now(),
      trackX: trackX.get(),
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipeOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId)
      return;
    const horizontalDistance = event.clientX - origin.x;
    const verticalDistance = event.clientY - origin.y;

    if (origin.axis === 'pending') {
      if (Math.abs(horizontalDistance) < 8 && Math.abs(verticalDistance) < 8)
        return;
      if (Math.abs(verticalDistance) >= Math.abs(horizontalDistance)) {
        swipeOriginRef.current = undefined;
        return;
      }
      if (Math.abs(horizontalDistance) < Math.abs(verticalDistance) * 1.15)
        return;
      origin.axis = 'horizontal';
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    event.preventDefault();
    suppressClickRef.current = true;
    if (!isMotionEnabled)
      return;
    const direction = horizontalDistance < 0 ? 1 : -1;
    const nextIndex = activeIndex + direction;
    const hasAdjacentPage = Boolean(PERSONAL_SWIPE_TABS[nextIndex]);
    const resistedDistance = horizontalDistance * (hasAdjacentPage ? 1 : 0.18);
    const width = viewportWidthRef.current || getViewportWidth(viewportRef.current);
    trackX.set(origin.trackX + resistedDistance);
    if (hasAdjacentPage) {
      const progress = Math.min(1, Math.abs(horizontalDistance) / width);
      const currentIndicator = getIndicatorIndex(activeIndex);
      const nextIndicator = getIndicatorIndex(nextIndex);
      indicatorProgress.set(currentIndicator + (nextIndicator - currentIndicator) * progress);
      indicatorStretch.set(1 + Math.min(0.06, progress * 0.06));
    }
  };

  const handlePointerCancel = () => {
    swipeOriginRef.current = undefined;
    settleAtCurrentPage();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipeOriginRef.current;
    swipeOriginRef.current = undefined;
    if (!origin || origin.pointerId !== event.pointerId)
      return;

    const horizontalDistance = event.clientX - origin.x;
    const verticalDistance = event.clientY - origin.y;
    const elapsed = Math.max(1, performance.now() - origin.startedAt);
    const horizontalVelocity = Math.abs(horizontalDistance) / elapsed;
    const width = viewportWidthRef.current || getViewportWidth(viewportRef.current);
    const swipeThreshold = Math.min(72, width * 0.2);
    const isHorizontal = origin.axis === 'horizontal'
      && Math.abs(horizontalDistance) > Math.abs(verticalDistance) * 1.35;
    const isIntentionalSwipe = isHorizontal
      && (Math.abs(horizontalDistance) >= swipeThreshold
        || (Math.abs(horizontalDistance) >= 44 && horizontalVelocity >= 0.45));
    const nextIndex = activeIndex + (horizontalDistance < 0 ? 1 : -1);
    const nextTab = PERSONAL_SWIPE_TABS[nextIndex];
    if (!isIntentionalSwipe || !nextTab) {
      settleAtCurrentPage();
      return;
    }

    playSound.turnPage();
    navigate(nextTab.route);
  };

  return (
    <div
      className="relative h-full w-full min-w-0 touch-pan-y overflow-hidden [background:var(--ww-page-gradient)] [overflow:clip]"
      data-personal-tab-swipe-navigation
      onClickCapture={(event) => {
        if (!suppressClickRef.current)
          return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={viewportRef}
      style={{ contain: 'layout paint size' }}
    >
      <PersonalTabBarOwnerContext.Provider value>
        <m.div
          className="absolute inset-0 w-full will-change-transform"
          data-personal-tab-track
          style={{ x: trackX }}
        >
          {pages.map((page, index) => {
            const isActive = index === activeIndex;
            return (
              <section
                aria-hidden={!isActive}
                className="absolute inset-0 flex w-full min-w-0 flex-col overflow-hidden [overflow:clip]"
                data-personal-tab-page={page.key}
                data-personal-tab-page-active={isActive || undefined}
                key={page.key}
                style={{
                  pointerEvents: isActive ? 'auto' : 'none',
                  transform: `translate3d(${index * 100}%, 0, 0)`,
                }}
              >
                {page.content}
              </section>
            );
          })}
        </m.div>
      </PersonalTabBarOwnerContext.Provider>
      <TabBar
        activeKey={PERSONAL_SWIPE_TABS[activeIndex]?.key}
        indicatorProgress={indicatorProgress}
        indicatorStretch={indicatorStretch}
      />
    </div>
  );
};
