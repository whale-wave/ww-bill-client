import type { FC, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { DesignIcon, GradientPanel, MetricGrid } from '@/shared/ui';
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
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' '))
      return;
    event.preventDefault();
    onClick();
  };
  return (
    <GradientPanel
      aria-label={onClick ? title : undefined}
      as="article"
      className={cn('overflow-hidden px-5 py-[18px] shadow-[0_6px_11px_rgba(96,80,184,0.12)]', onClick && 'cursor-pointer transition active:scale-[0.99]')}
      elevation="none"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      surface="lavender"
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/70 text-[#705cc0]">
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
