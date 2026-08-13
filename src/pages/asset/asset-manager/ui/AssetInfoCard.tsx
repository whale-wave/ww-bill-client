import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetSummaryInfo } from '@/entities/asset';
import { GradientPanel, MetricGrid } from '@/shared/ui';

export const AssetInfoCard: FC = () => {
  const { t } = useTranslation('asset');
  const { formatInfo } = useAssetSummaryInfo();

  return (
    <GradientPanel
      as="article"
      className="overflow-hidden px-[22px] pb-5 pt-[22px]"
      elevation="high"
      surface="lavender"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">
            {t('summary.netWorth')}
          </div>
          <div className="mt-1 flex min-w-0 items-baseline font-number text-ww-ink">
            <span className="mr-1 text-[15px] font-extrabold text-ww-mid">¥</span>
            <span className="truncate text-[32px] font-black leading-[42px]">{formatInfo.totalAsset}</span>
          </div>
        </div>
        <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[10px] font-bold text-primary-deep">
          {t('manager.overview')}
        </span>
      </div>
      <MetricGrid
        align="start"
        className="mt-[18px] border-t border-[rgba(100,160,200,0.18)] pt-[14px]"
        columns={2}
        density="standard"
        items={[
          { key: 'assets', label: t('summary.assets'), tone: 'income', value: `¥${formatInfo.addAsset}` },
          { key: 'liabilities', label: t('summary.liabilities'), tone: 'expense', value: `¥${formatInfo.subAsset}` },
        ]}
      />
    </GradientPanel>
  );
};
