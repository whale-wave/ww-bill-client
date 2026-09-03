import type { FC } from 'react';
import { SpinLoading } from 'antd-mobile';
import { CreditCard, Scale, TriangleAlert, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import { useAssetSummaryInfo, useGetAssetQuery } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, math } from '@/shared/lib';
import { IllustratedEmptyState, Surface } from '@/shared/ui';
import { ChartRetryButton } from './ChartRetryButton';

export const CurNetAssetStatus: FC = () => {
  const { t } = useTranslation('asset');
  const { data, isError, isFetching, isLoading, refetch } = useGetAssetQuery();
  const { info } = useAssetSummaryInfo();

  const metrics = useMemo(() => {
    const total = Number(math.add(info.addAsset, info.subAsset).toString());
    const rawAssetShare = total === 0
      ? 0.5
      : Number(math.divide(info.addAsset, total).toString());
    const assetShare = Math.max(0, Math.min(1, rawAssetShare));
    const liabilityShare = 1 - assetShare;
    const ratio = Number(info.addAsset) === 0
      ? 0
      : Number(math.multiply(math.divide(info.subAsset, info.addAsset), 100).toString());

    return {
      assetShare,
      liabilityShare,
      ratio,
    };
  }, [info.addAsset, info.subAsset]);

  return (
    <Surface as="article" className="overflow-hidden px-[18px] py-[18px]" material="raised">
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/70 bg-white/60 text-primary-deep shadow-ww-xs">
          <Scale size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-extrabold text-ww-ink">{t('chart.currentNetAssetStatus')}</h2>
          <p className="mt-0.5 text-[10px] font-semibold text-ww-soft">{t('manager.overview')}</p>
        </div>
      </header>

      {isLoading && (
        <div className="flex min-h-[210px] items-center justify-center">
          <SpinLoading color="primary" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-feedback-danger-surface text-feedback-danger">
            <TriangleAlert size={21} />
          </span>
          <p className="mt-3 text-[13px] font-extrabold text-ww-ink">{t('manager.loadError')}</p>
          <p className="mt-1 text-[11px] text-ww-soft">{t('manager.loadErrorDescription')}</p>
          <ChartRetryButton isLoading={isFetching} onRetry={() => void refetch()} />
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <IllustratedEmptyState
          className="min-h-[240px] px-2 py-5"
          icon={<Scale className="text-primary-deep" size={38} />}
          title={t('common:empty')}
        />
      )}

      {!isLoading && !isError && data.length > 0 && (
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] border border-white/75 bg-white/55 px-3.5 py-3.5 shadow-ww-xs backdrop-blur-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-ww-mid">
                <WalletCards className="text-primary-deep" size={13} />
                <span>{t('chart.asset')}</span>
              </div>
              <p className="mt-2 truncate font-number text-[16px] font-black text-ww-ink">
                ¥
                {formatAmount(info.addAsset)}
              </p>
            </div>
            <div className="rounded-[16px] border border-white/75 bg-white/55 px-3.5 py-3.5 shadow-ww-xs backdrop-blur-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-ww-mid">
                <CreditCard className="text-feedback-danger" size={13} />
                <span>{t('chart.liability')}</span>
              </div>
              <p className="mt-2 truncate font-number text-[16px] font-black text-feedback-danger">
                ¥
                {formatAmount(info.subAsset)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between font-number text-[9px] font-bold text-ww-soft">
              <span>
                {(metrics.assetShare * 100).toFixed(1)}
                %
              </span>
              <span>
                {(metrics.liabilityShare * 100).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full border border-white/60 bg-white/45 p-[2px]">
              <span
                className="ww-theme-progress h-full rounded-l-full transition-[width] duration-500"
                style={{ width: `${metrics.assetShare * 100}%` }}
              />
              <span
                className="ww-theme-liability-progress h-full rounded-r-full transition-[width] duration-500"
                style={{ width: `${metrics.liabilityShare * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[16px] border border-white/70 bg-white/52 px-3.5 backdrop-blur-xl">
            <div className="flex min-h-[48px] items-center justify-between gap-3 border-0 border-b border-solid border-border-primary">
              <span className="text-[11px] font-semibold text-ww-mid">{t('chart.netAsset')}</span>
              <span className="font-number text-[14px] font-black text-ww-ink">
                ¥
                {formatAmount(info.totalAsset)}
              </span>
            </div>
            <div className="flex min-h-[48px] items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-ww-mid">{t('chart.assetLiabilityRatio')}</span>
              <span className="font-number text-[14px] font-black text-primary-deep">
                {formatAmount(metrics.ratio)}
                %
              </span>
            </div>
          </div>
        </div>
      )}
    </Surface>
  );
};
