import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, Icon, MetricGrid } from '@/shared/ui';
import { useAssetSummaryInfo } from '../lib/use-asset-summary';

export interface AssetSummaryCardPresentationProps {
  asset: string;
  liability: string;
  netAsset: string;
  onClick?: () => void;
  title: string;
}

export const AssetSummaryCardPresentation: FC<AssetSummaryCardPresentationProps> = ({
  asset,
  liability,
  netAsset,
  onClick,
  title,
}) => {
  const { t } = useTranslation('asset');
  return (
    <GradientPanel as="article" className="cursor-pointer overflow-hidden px-5 py-[18px]" elevation="high" onClick={onClick} surface="lavender">
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/70 text-[#705cc0]">
          <Icon className="text-[18px]" name="asset-steward" />
        </span>
        <div className="text-[14px] font-bold leading-[21px] text-ww-ink">{title}</div>
      </div>
      <MetricGrid
        className="mt-[14px]"
        density="compact"
        items={[
          { key: 'netAsset', label: t('asset:manager.netAsset'), tone: 'primary', value: netAsset },
          { key: 'asset', label: t('asset:manager.asset'), tone: 'income', value: asset },
          { key: 'liability', label: t('asset:manager.liability'), tone: 'expense', value: liability },
        ]}
      />
    </GradientPanel>
  );
};

export const AssetManagerCard: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const { formatInfo } = useAssetSummaryInfo();
  const handleClick = useCallback(() => navigate(ROUTES_PATH.ASSET.getPath()), [navigate]);

  return (
    <AssetSummaryCardPresentation
      asset={formatInfo.addAsset}
      liability={formatInfo.subAsset}
      netAsset={formatInfo.totalAsset}
      onClick={handleClick}
      title={t('asset:manager.title')}
    />
  );
};
