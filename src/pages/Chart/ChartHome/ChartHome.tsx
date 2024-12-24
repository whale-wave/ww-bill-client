import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
import { TabBar } from '@/components';
import { Top } from '@/pages/Chart/ChartHome/components';

const ChartHome: FC = () => {
  const tabs = [
    {
      title: '2022年',
      children: <div>2022年</div>,
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

  return (
    <>
      <Top />
      <Tabs
        // activeLineMode="fixed"
        style={{
          // '--fixed-active-line-width': '20px',
          // '--title-font-size': '12px',
          // '--active-title-color': '#000000',
        }}
        // onChange={key => tabChange(key)}
      >
        {
          tabs.map(item => (
            <Tabs.Tab title={item.title} key={item.title}>
              {item.children}
            </Tabs.Tab>
          ))
        }
      </Tabs>
      <TabBar active={1} />
    </>
  );
};

export default ChartHome;
