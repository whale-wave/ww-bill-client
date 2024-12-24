import { type FC, useCallback, useState } from 'react';
import { Tabs } from 'antd-mobile';
import { TabBar } from '@/components';
import { ChartContent, Top } from '@/pages/Chart/ChartHome/components';
import { cn } from '@/utils';

const ChartHome: FC = () => {
  const tabs = [
    {
      title: '2022年',
      children: <ChartContent />,
    },
    {
      title: '去年',
      children: <div>去年</div>,
    },
    {
      title: '今年',
      children: <div>今年</div>,
    },
  ];

  const [activeKey, setActiveKey] = useState(tabs[0].title);

  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
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
          activeKey={activeKey}
          onChange={handleTabChange}
        >
          {
            tabs.map(item => (
              <Tabs.Tab className="" title={item.title} key={item.title}>
                {item.children}
              </Tabs.Tab>
            ))
          }
        </Tabs>
      </div>
      <TabBar active={1} />
    </>
  );
};

export default ChartHome;
