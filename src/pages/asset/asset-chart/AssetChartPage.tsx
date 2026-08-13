import type { FC, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssetStatisticalRecordType } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';
import { AssetTabBar } from '../asset-manager/ui';
import styles from './AssetChart.module.scss';
import { AssetRanking, AssetTrendChart, CurAssetStatus, CurNetAssetStatus } from './ui';

const CHART_TYPES = [
  AssetStatisticalRecordType.ASSET,
  AssetStatisticalRecordType.LIABILITY,
  AssetStatisticalRecordType.NET_ASSET,
] as const;

function isChartType(value: string | null): value is AssetStatisticalRecordType {
  return value !== null && (CHART_TYPES as readonly string[]).includes(value);
}

const AssetChart: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('type') ?? searchParams.get('chart.asset');
  const selectTab = isChartType(requestedType) ? requestedType : AssetStatisticalRecordType.ASSET;

  const tabs = [
    { name: t('tab.asset'), value: AssetStatisticalRecordType.ASSET },
    { name: t('tab.liability'), value: AssetStatisticalRecordType.LIABILITY },
    { name: t('tab.netAsset'), value: AssetStatisticalRecordType.NET_ASSET },
  ];

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onChangeTab = useCallback((type: AssetStatisticalRecordType) => {
    setSearchParams({ type }, { replace: true });
  }, [setSearchParams]);

  const onTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
      return;

    event.preventDefault();
    const currentIndex = CHART_TYPES.indexOf(selectTab);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? CHART_TYPES.length - 1
        : event.key === 'ArrowRight'
          ? (currentIndex + 1) % CHART_TYPES.length
          : (currentIndex - 1 + CHART_TYPES.length) % CHART_TYPES.length;
    const nextType = CHART_TYPES[nextIndex];
    onChangeTab(nextType);

    const tabList = event.currentTarget.closest<HTMLElement>('[role="tablist"]');
    const tabButtons = tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabButtons?.[nextIndex]?.focus();
  }, [onChangeTab, selectTab]);

  return (
    <div className={`${styles['asset-chart']} page-new overflow-hidden`}>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('manager.subtitle')}
        title={t('assetChartTitle')}
      />

      <div className="relative z-10 shrink-0 px-[18px] pb-3 pt-1">
        <div
          aria-label={t('assetChartTitle')}
          className="grid grid-cols-3 gap-1 rounded-[17px] border border-border-primary bg-white/60 p-1 shadow-ww-xs backdrop-blur-xl"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isSelected = selectTab === tab.value;
            return (
              <button
                aria-selected={isSelected}
                className={isSelected
                  ? 'h-10 rounded-[13px] border border-solid border-white/80 bg-white text-[13px] font-extrabold text-primary-deep shadow-ww-xs transition-all'
                  : 'h-10 rounded-[13px] border border-solid border-transparent bg-transparent text-[13px] font-semibold text-ww-mid transition-all active:bg-white/55'}
                key={tab.value}
                onClick={() => onChangeTab(tab.value)}
                onKeyDown={onTabKeyDown}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      <main className={`${styles['scroll-area']} ww-tab-bar-scroll-padding relative z-[1] min-h-0 flex-1 overflow-y-auto px-[18px]`}>
        <div className={`${styles['tab-content']} space-y-[14px] pb-4`} key={selectTab}>
          <AssetTrendChart type={selectTab} />
          {selectTab === AssetStatisticalRecordType.NET_ASSET
            ? <CurNetAssetStatus />
            : (
                <>
                  <CurAssetStatus type={selectTab} />
                  <AssetRanking type={selectTab} />
                </>
              )}
        </div>
      </main>

      <AssetTabBar activeKey="chart" />
    </div>
  );
};

export default AssetChart;
