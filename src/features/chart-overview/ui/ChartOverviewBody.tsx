import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
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
    <>
      <Top />
      <div className="fixed left-0 right-0 top-[calc(42.94px+42.4px)]">
        <Tabs
          activeKey={tabActive}
          className="[--adm-color-primary:#333] [--content-padding:0px] [--title-font-size:14px]"
          onChange={handleTabChange}
        >
          {tabs.map(tabItem => (
            <Tabs.Tab key={tabItem.key} title={tabItem.name} />
          ))}
        </Tabs>
      </div>
      <ChartContent />
    </>
  );
};

export const ChartOverviewPresentation = ChartOverviewBody;
