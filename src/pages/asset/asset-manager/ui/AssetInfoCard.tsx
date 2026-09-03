import type { FC } from 'react';
import { Skeleton } from 'antd-mobile';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAssetSummaryInfo } from '@/entities/asset';
import { MetricGrid, Surface } from '@/shared/ui';

export const AssetInfoCard: FC = () => {
  const { t } = useTranslation('asset');
  const { formatInfo, isError, isLoading, refetch } = useAssetSummaryInfo();

  return (
    <Surface
      as="article"
      className="overflow-hidden px-[22px] pb-5 pt-[22px]"
      material="raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">
            {t('summary.netWorth')}
          </div>
          {isLoading
            ? <Skeleton.Title className="!mt-2 !h-8 !w-[160px]" animated />
            : (
                <div className="mt-1 flex min-w-0 items-baseline font-number text-ww-ink">
                  <span className="mr-1 text-[15px] font-extrabold text-ww-mid">¥</span>
                  <span className="truncate text-[32px] font-black leading-[42px]">{isError ? '--' : formatInfo.totalAsset}</span>
                </div>
              )}
        </div>
        {isError
          ? (
              <button
                className="flex h-11 items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 text-[10px] font-black text-primary-deep shadow-ww-xs"
                onClick={() => void refetch()}
                type="button"
              >
                <RefreshCw size={13} strokeWidth={2} />
                {t('retry')}
              </button>
            )
          : (
              <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[10px] font-bold text-primary-deep">
                {t('manager.overview')}
              </span>
            )}
      </div>
      <MetricGrid
        align="start"
        className="mt-[18px] border-t border-[rgba(100,160,200,0.18)] pt-[14px]"
        columns={2}
        density="standard"
        items={[
          { key: 'assets', label: t('summary.assets'), tone: 'income', value: isLoading || isError ? '--' : `¥${formatInfo.addAsset}` },
          { key: 'liabilities', label: t('summary.liabilities'), tone: 'expense', value: isLoading || isError ? '--' : `¥${formatInfo.subAsset}` },
        ]}
      />
    </Surface>
  );
};
