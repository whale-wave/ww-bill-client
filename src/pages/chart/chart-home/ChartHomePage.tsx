import type { TabsProps } from 'antd-mobile';
import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
import { useCallback } from 'react';
import { useChartHome } from '@/pages/chart/chart-home/model/chart-home-context';
import { ChartHomeProvider } from '@/pages/chart/chart-home/model/ChartHomeProvider';
import { ChartContent, Top } from '@/pages/chart/chart-home/ui';
import { cn } from '@/shared/lib';
import { TabBar } from '@/widgets/layout';

const ChartHomeInner: FC = () => {
  const { tabs, tabActive, setTabActive } = useChartHome();

  const tabStyle: TabsProps['style'] = {
    '--content-padding': '0px',
    '--title-font-size': '14px',
  };
  const originalStyle = {
    '--adm-color-primary': '#333',
  };

  const handleTabChange = useCallback((key: string) => {
    setTabActive(key);
  }, [setTabActive]);

  return (
    <>
      <Top />
      <div
        className={cn('fixed top-[calc(42.94px+42.4px)] left-0 right-0')}
      >
        <Tabs
          style={{ ...tabStyle, ...originalStyle }}
          activeKey={tabActive}
          onChange={handleTabChange}
        >
          {
            tabs.map(tabItem => (
              <Tabs.Tab title={tabItem.name} key={tabItem.key} />
            ))
          }
        </Tabs>
      </div>
      <ChartContent />
      <TabBar active={1} />
    </>
  );
};

const ChartHome: FC = () => {
  return (
    <ChartHomeProvider>
      <ChartHomeInner />
    </ChartHomeProvider>
  );
};

export default ChartHome;
