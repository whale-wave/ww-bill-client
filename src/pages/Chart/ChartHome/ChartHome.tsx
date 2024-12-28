import { type FC, useCallback, useEffect } from 'react';
import { Tabs } from 'antd-mobile';
import { usePrevious } from 'ahooks';
import { TabBar } from '@/components';
import { ChartContent, Top } from '@/pages/Chart/ChartHome/components';
import { cn } from '@/utils';
import { useGetChartQuery } from '@/hooks';
import { useChartStore } from '@/store';

const ChartHome: FC = () => {
  const currentAmountType = useChartStore(state => state.currentAmountType);
  const previousCurrentAmountType = usePrevious(currentAmountType);
  const tabs = useChartStore(state => state.tabs);
  const tabActive = useChartStore(state => state.tabActive);
  const setTabActive = useChartStore(state => state.setTabActive);
  const setTabsByWeek = useChartStore(state => state.setTabsByWeek);
  const setCurTab = useChartStore(state => state.setCurTab);

  const { data } = useGetChartQuery({
    params: {
      type: currentAmountType,
      category: 'week',
    },
  });

  useEffect(() => {
    if (!data)
      return;
    setTabsByWeek(data);
  }, [data]);

  useEffect(() => {
    if (!!tabs.length && !tabActive) {
      setTabActive(tabs.at(-1)!.key);
    }
  }, [tabs, tabActive]);

  useEffect(() => {
    if (previousCurrentAmountType !== currentAmountType && !!tabs.length) {
      setTabActive(tabs.at(-1)!.key);
      setCurTab(tabs.at(-1)!);
    }
  }, [currentAmountType, tabs]);

  const handleTabChange = useCallback((key: string) => {
    setTabActive(key);
  }, []);

  return (
    <>
      <Top />
      <div className={cn('fixed top-[calc(42.94px+42.4px)] left-0 right-0')}>
        <Tabs
          style={{
            '--adm-color-primary': '#333',
            '--content-padding': 0,
            '--title-font-size': '14px',
          }}
          activeKey={tabActive}
          onChange={handleTabChange}
        >
          {
            tabs.map(tabItem => (
              <Tabs.Tab title={tabItem.name} key={tabItem.key} />
            ))
          }
        </Tabs>
        <ChartContent />
      </div>
      <TabBar active={1} />
    </>
  );
};

export default ChartHome;
