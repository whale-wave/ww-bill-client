import type { FC } from 'react';
import { useCallback } from 'react';
import { useChartOverview } from '../model/chart-overview-context';
import { ChartContent } from './ChartContent';
import { Top } from './Top';

export const ChartOverviewBody: FC = () => {
  const { setTabActive, tabActive, tabs } = useChartOverview();
  const handleTabChange = useCallback((key: string) => {
    setTabActive(key);
  }, [setTabActive]);

  return (
    <div className="flex min-h-0 flex-grow flex-col overflow-hidden" data-chart-overview>
      <Top />
      <div className="flex h-[46px] shrink-0 gap-[7px] overflow-x-auto px-[18px] pb-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(tabItem => (
          <button
            className={`shrink-0 rounded-full border border-solid px-[13px] py-1.5 text-[12px] leading-[18px] ${tabItem.key === tabActive ? 'border-primary bg-primary-light font-bold text-primary-deep shadow-[0_2px_5px_rgba(60,140,180,0.09)]' : 'border-border-primary bg-white/70 font-medium text-ww-soft'}`}
            key={tabItem.key}
            onClick={() => handleTabChange(tabItem.key)}
            type="button"
          >
            {tabItem.name}
          </button>
        ))}
      </div>
      <ChartContent />
    </div>
  );
};

export const ChartOverviewPresentation = ChartOverviewBody;
