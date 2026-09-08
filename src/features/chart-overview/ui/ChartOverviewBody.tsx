import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useChartOverview } from '../model/chart-overview-context';
import { ChartContent } from './ChartContent';
import { Top } from './Top';

export interface ChartOverviewPresentationProps {
  pieChart?: ReactNode;
  tagRanking?: ReactNode;
}

export const ChartOverviewBody: FC<ChartOverviewPresentationProps> = ({ pieChart, tagRanking }) => {
  const {
    currentAmountType,
    currentMetric,
    currentTimeRangeCategory,
    hasNewerPeriods,
    hasOlderPeriods,
    isLoadingNewerPeriods,
    isLoadingOlderPeriods,
    loadNewerPeriods,
    loadOlderPeriods,
    setTabActive,
    tabActive,
    tabs,
  } = useChartOverview();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const userScrolledRef = useRef(false);
  const prependSnapshotRef = useRef<{ length: number; width: number } | undefined>(undefined);
  const skipCenterRef = useRef(false);
  const tabKeysRevision = tabs.map(tab => tab.key).join('|');

  const handleTabChange = useCallback((key: string) => {
    setTabActive(key);
  }, [setTabActive]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !userScrolledRef.current || container.scrollWidth <= container.clientWidth + 1)
      return;

    if (container.scrollLeft <= 32 && hasOlderPeriods && !isLoadingOlderPeriods && loadOlderPeriods) {
      prependSnapshotRef.current = { length: tabs.length, width: container.scrollWidth };
      userScrolledRef.current = false;
      loadOlderPeriods();
      return;
    }

    const distanceToRight = container.scrollWidth - container.clientWidth - container.scrollLeft;
    if (distanceToRight <= 32 && hasNewerPeriods && !isLoadingNewerPeriods && loadNewerPeriods) {
      userScrolledRef.current = false;
      loadNewerPeriods();
    }
  }, [hasNewerPeriods, hasOlderPeriods, isLoadingNewerPeriods, isLoadingOlderPeriods, loadNewerPeriods, loadOlderPeriods, tabs.length]);

  useLayoutEffect(() => {
    const snapshot = prependSnapshotRef.current;
    const container = scrollContainerRef.current;
    if (!snapshot || !container || tabs.length <= snapshot.length)
      return;
    container.scrollLeft += container.scrollWidth - snapshot.width;
    prependSnapshotRef.current = undefined;
    skipCenterRef.current = true;
  }, [tabKeysRevision, tabs.length]);

  useEffect(() => {
    if (!isLoadingOlderPeriods && prependSnapshotRef.current?.length === tabs.length)
      prependSnapshotRef.current = undefined;
  }, [isLoadingOlderPeriods, tabs.length]);

  useLayoutEffect(() => {
    if (skipCenterRef.current) {
      skipCenterRef.current = false;
      return undefined;
    }
    const scrollContainer = scrollContainerRef.current;
    const activeTab = activeTabRef.current;
    if (!scrollContainer || !activeTab || typeof requestAnimationFrame !== 'function')
      return undefined;

    const frameId = requestAnimationFrame(() => {
      if (
        scrollContainerRef.current !== scrollContainer
        || activeTabRef.current !== activeTab
        || typeof scrollContainer.scrollTo !== 'function'
      ) {
        return;
      }

      const left = activeTab.offsetLeft - (scrollContainer.clientWidth - activeTab.offsetWidth) / 2;
      scrollContainer.scrollTo({
        behavior: 'auto',
        left: Math.max(0, left),
      });
    });

    return () => {
      if (typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(frameId);
    };
  }, [currentAmountType, currentMetric, currentTimeRangeCategory, tabActive, tabKeysRevision, tabs.length]);

  return (
    <div className="flex min-h-0 flex-grow flex-col overflow-hidden" data-chart-overview>
      <Top />
      <div
        ref={scrollContainerRef}
        className="flex h-[46px] shrink-0 snap-x snap-proximity gap-[7px] overflow-x-auto px-[18px] pb-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-tab-swipe-ignore
        data-chart-period-options
        onPointerMove={(event) => {
          if (event.buttons)
            userScrolledRef.current = true;
        }}
        onScroll={handleScroll}
        onTouchMove={() => {
          userScrolledRef.current = true;
        }}
        onWheel={() => {
          userScrolledRef.current = true;
        }}
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 18px, black calc(100% - 18px), transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 18px, black calc(100% - 18px), transparent)',
        }}
      >
        {isLoadingOlderPeriods && (
          <span aria-hidden className="my-auto size-4 shrink-0 animate-spin rounded-full border-2 border-primary-light border-t-primary" />
        )}
        {tabs.map(tabItem => (
          <button
            ref={tabItem.key === tabActive ? activeTabRef : undefined}
            aria-pressed={tabItem.key === tabActive}
            className={`shrink-0 snap-center rounded-full border border-solid px-[13px] py-1.5 text-[12px] leading-[18px] ${tabItem.key === tabActive ? 'border-primary bg-primary-light font-bold text-primary-deep shadow-[0_2px_5px_rgba(60,140,180,0.09)]' : 'border-border-primary bg-white/70 font-medium text-ww-soft'}`}
            key={tabItem.key}
            onClick={() => handleTabChange(tabItem.key)}
            type="button"
          >
            {tabItem.name}
          </button>
        ))}
        {isLoadingNewerPeriods && (
          <span aria-hidden className="my-auto size-4 shrink-0 animate-spin rounded-full border-2 border-primary-light border-t-primary" />
        )}
      </div>
      <ChartContent pieChart={pieChart} tagRanking={tagRanking} />
    </div>
  );
};

export const ChartOverviewPresentation = ChartOverviewBody;
