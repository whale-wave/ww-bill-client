import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAssetSummaryInfo } from '@/entities/asset';

export const AssetInfoCard: FC = () => {
  const { t } = useTranslation('asset');
  const { formatInfo } = useAssetSummaryInfo();

  return (
    <div className="flex flex-col bg-primary rounded-lg py-4 px-5 space-y-7">
      <div className="flex flex-col">
        <div>
          {t('summary.netWorth')}
        </div>
        <div className="text-3xl font-bold">{formatInfo.totalAsset}</div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-1 space-x-1">
          <div>{t('summary.assets')}</div>
          <div>{formatInfo.addAsset}</div>
        </div>
        <div className="flex flex-1 space-x-1">
          <div>{t('summary.liabilities')}</div>
          <div>{formatInfo.subAsset}</div>
        </div>
      </div>
    </div>
  );
};
