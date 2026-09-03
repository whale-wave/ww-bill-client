import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { ChevronRight, CreditCard, WalletCards } from 'lucide-react';
import { m } from 'motion/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAssetSummaryInfo, useGetAssetQuery } from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { formatAmount } from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState, PageLoadingState, useMotionPreference } from '@/shared/ui';
import { IconBlock } from '../../ui';

interface WalletCardTone {
  amountClassName: string;
  className: string;
  detailClassName: string;
}

function getWalletCardTone(asset: Asset, index: number): WalletCardTone {
  if (asset.assetGroup.type === 'sub') {
    return {
      amountClassName: 'text-finance-expense',
      className: 'bg-ww-ink text-white',
      detailClassName: 'text-white/60',
    };
  }

  if (index % 3 === 0) {
    return {
      amountClassName: 'text-white',
      className: 'bg-primary text-white',
      detailClassName: 'text-white/65',
    };
  }

  if (index % 3 === 1) {
    return {
      amountClassName: 'text-ww-ink',
      className: 'border border-white/75 bg-ww-surface text-ww-ink',
      detailClassName: 'text-ww-mid',
    };
  }

  return {
    amountClassName: 'text-primary-deep',
    className: 'bg-primary-light text-primary-deep',
    detailClassName: 'text-primary-deep/65',
  };
}

export const AssetWalletPack: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const { data: assets, isError, isLoading, refetch } = useGetAssetQuery();
  const { formatInfo } = useAssetSummaryInfo();
  const { isMotionEnabled } = useMotionPreference();
  const [isExpanded, setIsExpanded] = useState(false);

  const walletHeight = useMemo(() => {
    if (!isExpanded)
      return 338;
    // Keep the total bar outside the last expanded card instead of layering it above.
    return Math.max(430, assets.length * 138 + 182);
  }, [assets.length, isExpanded]);

  if (isLoading) {
    return <PageLoadingState compact className="rounded-[20px] border border-border-primary bg-white/70" label={t('common:nav.loading')} />;
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/75 shadow-ww-xs">
        <IllustratedEmptyState
          actionLabel={t('retry')}
          className="min-h-[280px]"
          description={t('manager.loadErrorDescription')}
          icon={<WalletCards className="text-primary-deep" size={40} strokeWidth={1.6} />}
          onAction={() => void refetch()}
          title={t('manager.loadError')}
        />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/75 shadow-ww-xs">
        <IllustratedEmptyState
          accentIcon={<DesignIcon name="tab-add" size={20} />}
          actionLabel={t('manager.addAccount')}
          className="min-h-[300px]"
          description={t('manager.emptyDescription')}
          icon={<DesignIcon name="discovery-asset" size={46} />}
          onAction={() => navigate(ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath())}
          title={t('manager.emptyTitle')}
        />
      </div>
    );
  }

  return (
    <section aria-labelledby="asset-wallet-heading">
      <div className="flex items-center justify-between px-1 pb-[10px]">
        <div>
          <h2 className="text-[14px] font-bold leading-[21px] text-ww-ink" id="asset-wallet-heading">{t('manager.walletView')}</h2>
          <p className="mt-0.5 text-[11px] text-ww-mid">{isExpanded ? t('manager.walletExpandedHint') : t('manager.walletCollapsedHint')}</p>
        </div>
        <span className="font-number text-[12px] font-semibold text-ww-soft">{t('manager.walletCount', { count: assets.length })}</span>
      </div>

      <m.div
        animate={{ height: walletHeight }}
        className="relative overflow-hidden rounded-[24px] bg-ww-surface shadow-[0_16px_30px_rgb(31_49_69_/_14%)]"
        onClick={(event) => {
          if (isExpanded && event.target === event.currentTarget)
            setIsExpanded(false);
        }}
        transition={{ duration: isMotionEnabled ? 0.45 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <m.div
          animate={isExpanded ? { height: 126 } : { height: [174, 238, 300] }}
          className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[26px] bg-ww-ink shadow-[0_12px_22px_rgb(18_27_40_/_20%)]"
          initial={{ height: 154 }}
          transition={{ duration: isMotionEnabled ? 0.82 : 0, ease: [0.22, 1, 0.36, 1], times: [0, 0.56, 1] }}
        />

        {assets.map((asset, index) => {
          const tone = getWalletCardTone(asset, index);
          const collapsedIndex = Math.min(index, 2);
          const isVisibleWhenCollapsed = index < 3;
          const expandedY = 16 + index * 138;
          const collapsedY = 16 + collapsedIndex * 32;

          return (
            <m.button
              animate={{
                opacity: isExpanded || isVisibleWhenCollapsed ? 1 : 0,
                rotate: isExpanded ? 0 : (collapsedIndex - 1) * 2.5,
                scale: isExpanded ? 1 : 0.985,
                x: isExpanded ? 0 : (collapsedIndex - 1) * 5,
                y: isExpanded ? expandedY : collapsedY,
              }}
              aria-label={isExpanded ? t('manager.walletOpenAsset', { name: asset.name }) : t('manager.walletExpand')}
              className={`absolute left-7 right-7 top-0 h-[122px] rounded-[21px] border-0 px-4 py-3.5 text-left shadow-[0_10px_20px_rgb(29_49_71_/_16%)] ${tone.className}`}
              initial={{ opacity: isVisibleWhenCollapsed ? 0 : 0, scale: 0.9, y: 134 }}
              key={asset.id}
              onClick={() => {
                if (isExpanded)
                  navigate(ROUTES_PATH.ASSET_DETAIL.getPath(asset.id));
                else
                  setIsExpanded(true);
              }}
              style={{ pointerEvents: isExpanded || isVisibleWhenCollapsed ? 'auto' : 'none', zIndex: 4 + index }}
              transition={{
                delay: isExpanded ? index * 0.1 : index * 0.045,
                duration: isMotionEnabled ? (isExpanded ? 0.58 : 0.72) : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              type="button"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black tracking-[0.07em] ${tone.detailClassName}`}>WHALER WAVE</span>
                <CreditCard size={16} strokeWidth={2.1} />
              </div>
              <div className="mt-4 flex items-end gap-3">
                <IconBlock name={asset.assetGroup.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-black">{asset.name}</span>
                  <span className={`mt-0.5 block truncate text-[10px] font-bold ${tone.detailClassName}`}>{asset.comment || asset.assetGroup.name}</span>
                </span>
                <span className="mb-0.5 flex shrink-0 items-center gap-1.5">
                  <span className={`font-number text-[17px] font-black tracking-[-0.03em] ${tone.amountClassName}`}>
                    {asset.assetGroup.type === 'sub' ? '-' : ''}
                    ¥
                    {formatAmount(Number(asset.amount))}
                  </span>
                  {isExpanded && <ChevronRight size={16} strokeWidth={2.25} />}
                </span>
              </div>
            </m.button>
          );
        })}

        <m.button
          animate={isExpanded ? { opacity: 1, y: 0 } : { opacity: [0, 0, 1], y: [8, 8, 0] }}
          aria-label={isExpanded ? t('manager.walletCollapse') : t('manager.walletExpand')}
          className="absolute bottom-5 left-6 right-6 z-[40] min-h-[116px] rounded-[18px] border border-white/[0.07] bg-white/[0.035] px-3.5 py-3 text-left text-white"
          initial={{ opacity: 0, y: 8 }}
          onClick={() => setIsExpanded(value => !value)}
          transition={{ delay: isExpanded ? 0.32 : 0.42, duration: isMotionEnabled ? 0.24 : 0, ease: [0.22, 1, 0.36, 1] }}
          type="button"
          whileTap={isMotionEnabled ? { scale: 0.985 } : undefined}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2 py-1 text-[9px] font-black tracking-[0.04em] text-white/68">
              <WalletCards size={12} strokeWidth={2.2} />
              {t('summary.netWorth')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.11] px-2 py-1 text-[10px] font-black text-white/82">
              {isExpanded ? t('manager.walletCollapse') : t('manager.walletExpand')}
              <ChevronRight className={isExpanded ? 'rotate-90' : '-rotate-90'} size={14} strokeWidth={2.4} />
            </span>
          </span>
          <span className="mt-1.5 block font-number text-[27px] font-black leading-none tracking-[-0.055em]">
            ¥
            {' '}
            {formatInfo.totalAsset}
          </span>
          <span className="mt-2 flex gap-2">
            <span className="min-w-0 flex-1 rounded-[11px] bg-white/[0.065] px-2.5 py-1.5">
              <span className="block text-[9px] font-bold text-white/48">{t('summary.assets')}</span>
              <span className="mt-0.5 block truncate font-number text-[13px] font-black leading-none text-finance-income">
                ¥
                {formatInfo.addAsset}
              </span>
            </span>
            <span className="min-w-0 flex-1 rounded-[11px] bg-white/[0.065] px-2.5 py-1.5">
              <span className="block text-[9px] font-bold text-white/48">{t('summary.liabilities')}</span>
              <span className="mt-0.5 block truncate font-number text-[13px] font-black leading-none text-finance-expense">
                ¥
                {formatInfo.subAsset}
              </span>
            </span>
          </span>
        </m.button>
      </m.div>
    </section>
  );
};
