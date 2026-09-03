import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { Surface } from '@/shared/ui';
import { IconBlock } from '../../ui';
import { AssetAdjustPopup } from './AssetAdjustPopup';

export const AssetInfoCard: FC<{ asset: Asset }> = ({ asset }) => {
  const { t } = useTranslation('asset');
  const [adjustPopupVisible, setAdjustPopupVisible] = useState(false);
  const amountLabel = asset.assetGroup.type === 'sub' ? t('form.debt') : t('form.balance');

  return (
    <>
      <Surface className="relative overflow-hidden px-5 py-5" material="raised">
        <div aria-hidden="true" className="absolute -right-7 -top-10 h-32 w-32 rounded-full border-[20px] border-solid border-white/25" />
        <div className="relative flex items-start gap-3.5">
          <IconBlock name={asset.assetGroup.icon} />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-[16px] font-black leading-6 text-ww-ink">{asset.name}</h2>
              {asset.cardId && (
                <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 font-number text-[9px] font-bold text-ww-mid">
                  ••••
                  {asset.cardId}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-ww-mid">
              {asset.comment || asset.assetGroup.name}
            </p>
          </div>
        </div>
        <div className="relative mt-5 flex items-end justify-between gap-4 border-0 border-t border-solid border-[rgba(100,160,200,0.18)] pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.4px] text-ww-mid">{amountLabel}</p>
            <p className="mt-1 flex min-w-0 items-baseline font-number text-ww-ink">
              <span className="mr-1 text-[13px] font-extrabold text-ww-mid">¥</span>
              <span className="truncate text-[30px] font-black leading-9">{formatAmount(Number(asset.amount))}</span>
            </p>
          </div>
          <button
            className="mb-1 flex h-11 shrink-0 items-center gap-1.5 rounded-[14px] border border-solid border-white/85 bg-white/72 px-3 text-[11px] font-black text-primary-deep shadow-ww-xs"
            onClick={() => setAdjustPopupVisible(true)}
            type="button"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            {t('adjust.action')}
          </button>
        </div>
      </Surface>
      {adjustPopupVisible && (
        <AssetAdjustPopup
          asset={asset}
          onClose={() => setAdjustPopupVisible(false)}
          visible
        />
      )}
    </>
  );
};
