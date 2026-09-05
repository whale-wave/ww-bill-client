import type { FC, ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
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
    setTabActive,
    tabActive,
    tabs,
  } = useChartOverview();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const tabKeysRevision = tabs.map(tab => tab.key).join('|');

  const handleTabChange = useCallback((key: string) => {
    setTabActive(key);
  }, [setTabActive]);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const activeTab = activeTabRef.current;
    if (!scrollContainer || !activeTab || typeof requestAnimationFrame !== 'function')
      return undefined;

    const frameId = requestAnimationFrame(() => {
      if (
        scrollContainerRef.current !== scrollContainer
        || activeTabRef.current !== activeTab
        || typeof activeTab.scrollIntoView !== 'function'
      ) {
        return;
      }

      activeTab.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
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
        data-chart-period-options
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 18px, black calc(100% - 18px), transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 18px, black calc(100% - 18px), transparent)',
        }}
      >
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
      </div>
      <ChartContent pieChart={pieChart} tagRanking={tagRanking} />
    </div>
  );
};

export const ChartOverviewPresentation = ChartOverviewBody;
