import { type FC, useCallback } from 'react';
import { TabBar } from 'antd-mobile';
import { HistogramOutline, ReceiptOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/constants';

export const AssetTabBar: FC<{ activeKey: string }> = ({ activeKey }) => {
  const navigate = useNavigate();

  const tabs = [
    {
      key: 'home',
      title: '资产',
      icon: <ReceiptOutline />,
      onClick: () => {
        navigate(ROUTES_PATH.ASSET.getPath(), { replace: true });
      },
    },
    {
      key: 'chart',
      title: '图表',
      icon: <HistogramOutline />,
      onClick: () => {
        navigate(ROUTES_PATH.ASSET_CHART.getPath(), { replace: true });
      },
    },
  ];

  const onChange = useCallback((key: string) => {
    tabs.find(tab => tab.key === key)?.onClick?.();
  }, []);

  return (
    <TabBar activeKey={activeKey} onChange={onChange}>
      {tabs.map(tab => (
        <TabBar.Item key={tab.key} title={tab.title} icon={tab.icon} />
      ))}
    </TabBar>
  );
};
