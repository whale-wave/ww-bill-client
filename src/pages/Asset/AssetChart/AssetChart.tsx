import { type FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetTabBar } from '../AssetManager/components';
import { AssetTrendChart, CurAssetStatus } from './components';
import { AssetRanking } from './components/AssetRanking';
import { NavBar, TabList } from '@/components';

const AssetChart: FC = () => {
  const navigate = useNavigate();
  const tabs = [
    {
      name: '资产',
      value: 'asset',
    },
    {
      name: '负债',
      value: 'liability',
    },
    {
      name: '净资产',
      value: 'net-asset',
    },
  ];

  const [selectTab, setSelectTab] = useState<string>(tabs[0].value);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="page-new pt-[45px]">
      <NavBar className="bg-white" backArrow={false} back={false} right={<div className="text-base" onClick={onBack}>返回</div>}>
        图表
      </NavBar>
      <div className="px-2">
        <TabList
          className="w-full"
          selectValue={selectTab}
          tabs={tabs}
          onChange={setSelectTab}
        />
      </div>
      <div className="flex-1 px-2">
        <AssetTrendChart />
        <CurAssetStatus />
        <AssetRanking />
      </div>
      <AssetTabBar activeKey="chart" />
    </div>
  );
};

export default AssetChart;
