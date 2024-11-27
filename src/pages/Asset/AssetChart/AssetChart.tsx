import { type FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd-mobile';
import classNames from 'classnames';
import { AssetTabBar } from '../AssetManager/components';
import { AssetTrendChart, CurAssetStatus } from './components';
import { AssetRanking } from './components/AssetRanking';
import styles from './AssetChart.module.scss';
import { NavBar, TabList } from '@/components';

const AssetChart: FC = () => {
  const navigate = useNavigate();
  const tabs = [
    {
      name: '资产',
      value: 'asset',
      children: (
        <>
          <AssetTrendChart />
          <CurAssetStatus />
          <AssetRanking />
        </>
      ),
    },
    {
      name: '负债',
      value: 'liability',
      children: (
        <>
          <AssetTrendChart />
          <CurAssetStatus />
          <AssetRanking />
        </>
      ),
    },
    {
      name: '净资产',
      value: 'net-asset',
      children: (
        <>
          <AssetTrendChart />
        </>
      ),
    },
  ];

  const [selectTab, setSelectTab] = useState<string>(tabs[0].value);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={classNames(styles['asset-chart'], 'page-new pt-[45px]')}>
      <NavBar className="bg-white z-10" backArrow={false} back={false} right={<div className="text-base" onClick={onBack}>返回</div>}>
        图表
      </NavBar>
      <div className="px-2 fixed top-[45px] w-full bg-white z-10">
        <TabList
          className="w-full"
          selectValue={selectTab}
          tabs={tabs}
          onChange={setSelectTab}
        />
      </div>
      <Tabs onChange={setSelectTab} activeKey={selectTab}>
        {
          tabs.map(tab => (
            <Tabs.Tab key={tab.value} title={tab.name}>
              <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto mt-[40px] mb-[50px]">
                {tab.children}
              </div>
            </Tabs.Tab>
          ))
        }
      </Tabs>
      <AssetTabBar activeKey="chart" />
    </div>
  );
};

export default AssetChart;
