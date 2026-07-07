import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssetStatisticalRecordType } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { NavBar, TabList } from '@/shared/ui';
import { AssetTabBar } from '../asset-manager/ui';
import styles from './AssetChart.module.scss';
import { AssetTrendChart, CurAssetStatus, CurNetAssetStatus } from './ui';
import { AssetRanking } from './ui/AssetRanking';

const AssetChart: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('chart.asset') as AssetStatisticalRecordType || AssetStatisticalRecordType.ASSET;

  const tabs = [
    {
      name: t('tab.asset'),
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
      name: t('tab.liability'),
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
      name: t('tab.netAsset'),
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
    <div className={classNames(styles['asset-chart'], 'page-new')}>
      <NavBar className="bg-white z-10" backArrow={false} back={false} right={<div className="text-base" onClick={onBack}>{t('common:nav.back')}</div>}>
        {t('assetChartTitle')}
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
