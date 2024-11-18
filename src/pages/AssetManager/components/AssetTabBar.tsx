import type { FC } from 'react';
import { TabBar } from 'antd-mobile';
import { HistogramOutline, ReceiptOutline } from 'antd-mobile-icons';

export const AssetTabBar: FC = () => {
  const tabs = [
    {
      key: 'home',
      title: '资产',
      icon: <ReceiptOutline />,
    },
    {
      key: 'todo',
      title: '图表',
      icon: <HistogramOutline />,
    },
  ];

  return (
    <TabBar>
      {tabs.map(tab => (
        <TabBar.Item key={tab.key} title={tab.title} icon={tab.icon} />
      ))}
    </TabBar>
  );
};
