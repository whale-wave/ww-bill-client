import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, MetricGrid, Surface } from '@/shared/ui';
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
    <Surface
      as="article"
      className="relative overflow-hidden px-5 py-[18px]"
      material="raised"
    >
      {onClick && <button aria-label={title} className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent" onClick={onClick} type="button" />}
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/70 text-primary-deep">
          <DesignIcon name="discovery-asset" size={18} />
        </span>
        <div className="text-[14px] font-bold leading-[21px] text-ww-ink">{title}</div>
      </div>
      <MetricGrid
        className="mt-[14px]"
        density="compact"
        items={[
          { key: 'netAsset', label: t('asset:manager.netAsset'), tone: 'primary', value: `¥${netAsset}` },
          { key: 'asset', label: t('asset:manager.asset'), tone: 'income', value: `¥${asset}` },
          { key: 'liability', label: t('asset:manager.liability'), tone: 'expense', value: `¥${liability}` },
        ]}
      />
    </Surface>
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
