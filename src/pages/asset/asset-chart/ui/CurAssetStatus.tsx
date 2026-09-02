import type { FC } from 'react';
import { SpinLoading } from 'antd-mobile';
import { PieChart as PieChartIcon, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { AssetStatisticalRecordType, useAssetSummaryInfo, useGetAssetQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { readAppearanceChartColors, useAppearanceRevision } from '@/shared/lib/appearance-tokens';
import { GradientPanel, IllustratedEmptyState } from '@/shared/ui';
import { ChartRetryButton } from './ChartRetryButton';

export const CurAssetStatus: FC<{ type: AssetStatisticalRecordType }> = ({ type }) => {
  const appearanceRevision = useAppearanceRevision();
  const { t } = useTranslation('asset');
  const { isError, isFetching, isLoading, refetch } = useGetAssetQuery();
  const { addAssetGroupPercent, subAssetGroupPercent, info } = useAssetSummaryInfo();
  const isAsset = type === AssetStatisticalRecordType.ASSET;
  const title = isAsset ? t('chart.currentAssetStatus') : t('chart.currentLiabilityStatus');
  const totalLabel = isAsset ? t('chart.totalAsset') : t('chart.totalLiability');
  const totalAmount = isAsset ? info.addAsset : info.subAsset;
  const groupPercent = isAsset ? addAssetGroupPercent : subAssetGroupPercent;

  const chartData = useMemo(() => {
    void appearanceRevision;
    const chartColors = readAppearanceChartColors();
    const validData = groupPercent
      .map(item => ({ name: item.group.name, value: Number(item.percent) }))
      .filter(item => Number.isFinite(item.value) && item.value > 0);
    const total = validData.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0)
      return [];

    return validData.map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length],
      percent: (item.value / total) * 100,
    }));
  }, [appearanceRevision, groupPercent]);

  const donutGradient = useMemo(() => {
    let cursor = 0;
    const stops = chartData.map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [chartData]);

  return (
    <GradientPanel as="article" className="overflow-hidden px-[18px] py-[18px]" elevation="standard" surface="glass">
      <header className="flex items-center gap-3">
        <span className="ww-theme-icon-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-primary-deep shadow-ww-xs">
          <PieChartIcon size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-extrabold text-ww-ink">{title}</h2>
          <p className="mt-0.5 text-[10px] font-semibold text-ww-soft">{totalLabel}</p>
        </div>
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

      {!isLoading && !isError && chartData.length === 0 && (
        <IllustratedEmptyState
          className="min-h-[230px] px-2 py-5"
          icon={<PieChartIcon className="text-primary-deep" size={38} />}
          title={t('common:empty')}
        />
      )}

      {!isLoading && !isError && chartData.length > 0 && (
        <div className="mt-5 flex items-center gap-4">
          <div
            aria-label={`${totalLabel} ${formatAmount(totalAmount)}`}
            className="relative h-[126px] w-[126px] shrink-0 rounded-full shadow-ww"
            role="img"
            style={{ background: donutGradient }}
          >
            <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full border border-white/80 bg-white/90 px-2 text-center shadow-inner backdrop-blur-xl">
              <span className="text-[9px] font-semibold text-ww-soft">{totalLabel}</span>
              <span className="mt-1 max-w-full truncate font-number text-[14px] font-black text-ww-ink">
                ¥
                {formatAmount(totalAmount)}
              </span>
            </div>
          </div>

          <div className="max-h-[152px] min-w-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {chartData.map(item => (
              <div className="flex items-center gap-2" key={item.name}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-ww-mid">{item.name}</span>
                <span className="shrink-0 font-number text-[10px] font-extrabold text-ww-ink">
                  {item.percent.toFixed(1)}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GradientPanel>
  );
};
