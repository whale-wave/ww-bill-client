import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { SpinLoading } from 'antd-mobile';
import { ChevronRight, ListOrdered, TriangleAlert, Trophy } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetStatisticalRecordType, useGetAssetQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, math } from '@/shared/lib';
import { readAppearanceChartColors, useAppearanceRevision } from '@/shared/lib/appearance-tokens';
import { GradientPanel, IllustratedEmptyState, ProgressBar } from '@/shared/ui';
import { IconBlock } from '../../ui';
import { ChartRetryButton } from './ChartRetryButton';

type AssetPercentItem = Asset & { percent: number; percentStr: string };

export const AssetRanking: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  useAppearanceRevision();
  const { t } = useTranslation('asset');
  const { data, isError, isFetching, isLoading, refetch } = useGetAssetQuery();
  const navigate = useNavigate();
  const title = type === AssetStatisticalRecordType.ASSET
    ? t('chart.assetRanking')
    : t('chart.liabilityRanking');
  const chartColors = readAppearanceChartColors();
  const accentColor = type === AssetStatisticalRecordType.ASSET ? chartColors[0] : chartColors[1];

  const rankList = useMemo<AssetPercentItem[]>(() => {
    const filterType = type === AssetStatisticalRecordType.ASSET ? 'add' : 'sub';
    const filteredList = data
      .filter(item => item.assetGroup.type === filterType)
      .toSorted((a, b) => Number(math.subtract(b.amount, a.amount).toString()));
    const total = filteredList.reduce((sum, item) => math.add(sum, item.amount).toNumber(), 0);

    return filteredList.map((item) => {
      const percent = total === 0
        ? 0
        : Math.max(0, Math.min(1, math.divide(item.amount, total).toNumber()));
      return {
        ...item,
        percent,
        percentStr: `${Number(math.multiply(percent, 100).toString()).toFixed(1)}%`,
      };
    });
  }, [data, type]);

  const handleClickItem = useCallback((item: AssetPercentItem) => () => {
    navigate(ROUTES_PATH.ASSET_DETAIL.getPath(item.id));
  }, [navigate]);

  return (
    <GradientPanel as="article" className="overflow-hidden px-[18px] py-[18px]" elevation="standard" surface="glass">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="ww-theme-icon-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-primary-deep shadow-ww-xs">
            <Trophy size={19} strokeWidth={2} />
          </span>
          <h2 className="truncate text-[14px] font-extrabold text-ww-ink">{title}</h2>
        </div>
        {!isLoading && !isError && (
          <span className="shrink-0 rounded-full bg-primary-light/35 px-2.5 py-1 font-number text-[10px] font-bold text-primary-deep">
            {t('manager.accountCount', { count: rankList.length })}
          </span>
        )}
      </header>

      {isLoading && (
        <div className="flex min-h-[190px] items-center justify-center">
          <SpinLoading color="primary" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f4] text-[#c04870]">
            <TriangleAlert size={21} />
          </span>
          <p className="mt-3 text-[13px] font-extrabold text-ww-ink">{t('manager.loadError')}</p>
          <p className="mt-1 text-[11px] text-ww-soft">{t('manager.loadErrorDescription')}</p>
          <ChartRetryButton isLoading={isFetching} onRetry={() => void refetch()} />
        </div>
      )}

      {!isLoading && !isError && rankList.length === 0 && (
        <IllustratedEmptyState
          className="min-h-[230px] px-2 py-5"
          icon={<ListOrdered className="text-primary-deep" size={38} />}
          title={t('common:empty')}
        />
      )}

      {!isLoading && !isError && rankList.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-[16px] border border-border-primary bg-white/58">
          {rankList.map((item, index) => (
            <button
              aria-label={`${item.name} ${formatAmount(Number(item.amount))}`}
              className={index === 0
                ? 'flex min-h-[82px] w-full items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left active:bg-primary-light/15'
                : 'relative ml-3.5 flex min-h-[82px] w-[calc(100%-14px)] items-center gap-3 border-0 border-t border-solid border-border-primary bg-transparent py-3 pr-3.5 text-left active:bg-primary-light/15'}
              key={item.id}
              onClick={handleClickItem(item)}
              type="button"
            >
              <div className="relative shrink-0">
                <IconBlock name={item.assetGroup.icon} />
                <span
                  className="absolute -left-1.5 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-solid border-white px-1 font-number text-[9px] font-black text-white shadow-ww-xs"
                  style={{ backgroundColor: index < 3 ? accentColor : '#9baebb' }}
                >
                  {index + 1}
                </span>
              </div>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-extrabold text-ww-ink">{item.name}</span>
                  <span className="shrink-0 font-number text-[13px] font-black text-ww-ink">
                    ¥
                    {formatAmount(Number(item.amount))}
                  </span>
                </span>
                <span className="mt-1 flex items-center justify-between gap-3">
                  <span className="truncate text-[10px] font-medium text-ww-soft">{item.comment || item.assetGroup.name}</span>
                  <span className="shrink-0 font-number text-[10px] font-bold text-ww-mid">{item.percentStr}</span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-primary-light/25">
                  <ProgressBar color={accentColor} percent={item.percent} />
                </span>
              </span>
              <ChevronRight className="shrink-0 text-ww-ghost" size={15} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}
    </GradientPanel>
  );
};
