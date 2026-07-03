import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavBar, TabList } from '@/components';
import { AssetTabBar } from '../AssetManager/components';
import styles from './AssetChart.module.scss';
import { AssetTrendChart, CurAssetStatus, CurNetAssetStatus } from './components';
import { AssetRanking } from './components/AssetRanking';
import { AssetStatisticalRecordType } from './types';

const AssetChart: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as AssetStatisticalRecordType || AssetStatisticalRecordType.ASSET;

  const tabs = [
    {
      name: '资产',
      value: AssetStatisticalRecordType.ASSET,
      children: (
        <>
          <AssetTrendChart type={AssetStatisticalRecordType.ASSET} />
          <CurAssetStatus type={AssetStatisticalRecordType.ASSET} />
          <AssetRanking type={AssetStatisticalRecordType.ASSET} />
        </>
      ),
    },
    {
      name: '负债',
      value: AssetStatisticalRecordType.LIABILITY,
      children: (
        <>
          <AssetTrendChart type={AssetStatisticalRecordType.LIABILITY} />
          <CurAssetStatus type={AssetStatisticalRecordType.LIABILITY} />
          <AssetRanking type={AssetStatisticalRecordType.LIABILITY} />
        </>
      ),
    },
    {
      name: '净资产',
      value: AssetStatisticalRecordType.NET_ASSET,
      children: (
        <>
          <AssetTrendChart type={AssetStatisticalRecordType.NET_ASSET} />
          <CurNetAssetStatus />
        </>
      ),
    },
  ];

  const [selectTab, setSelectTab] = useState<AssetStatisticalRecordType>(type);

  const onChangeActiveKey = useCallback((key: string) => {
    setSelectTab(key as AssetStatisticalRecordType);
    // setSearchParams({ type: key });
  }, []);

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
          onChange={onChangeActiveKey}
        />
      </div>
      <Tabs onChange={onChangeActiveKey} activeKey={selectTab}>
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
