import type { PopupProps } from 'antd-mobile';
import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Button, Input, Toast } from 'antd-mobile';
import { CircleDollarSign } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePatchAssetAdjustMutation } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { formatAmount, normalizeAmount } from '@/shared/lib';
import { AppBottomSheet } from '@/shared/ui';

export interface AssetAdjustPopupProps extends PopupProps {
  onClose: () => void;
  asset: Asset;
}

export const AssetAdjustPopup: FC<AssetAdjustPopupProps> = (props) => {
  const { visible, onClose, asset } = props;
  const { t } = useTranslation('asset');
  const [amount, setAmount] = useState<string>(asset.amount);
  const prevAmountRef = useRef<string>(asset.amount);
  const [patchAssetAdjustMutate, mutation] = usePatchAssetAdjustMutation();

  useEffect(() => {
    prevAmountRef.current = amount;
  }, [amount]);

  const handleAmountChange = useCallback((value: string) => {
    const normalizedAmount = normalizeAmount(value, prevAmountRef.current);

    setAmount(normalizedAmount);
  }, []);

  const handleAdjust = useCallback(async () => {
    if (!amount || mutation.isLoading)
      return;
    try {
      await patchAssetAdjustMutate({
        id: asset.id,
        data: { amount },
      });
      setAmount('');
      onClose();
      Toast.show({ icon: 'success', content: t('adjust.success') });
    }
    catch {
      Toast.show({ icon: 'fail', content: t('adjust.failed') });
    }
  }, [amount, asset.id, mutation.isLoading, onClose, patchAssetAdjustMutate, t]);

  return (
    <AppBottomSheet
      destroyOnClose
      visible={visible}
      onMaskClick={onClose}
      showCloseButton
      onClose={onClose}
      position="bottom"
    >
      <div className="px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-14">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-light/70 text-primary-deep">
            <CircleDollarSign size={21} strokeWidth={1.8} />
          </span>
          <div>
            <h2>{t('adjust.title')}</h2>
            <p className="mt-1 text-[11px] font-semibold leading-4 text-ww-mid">
              {t('adjust.currentValue', {
                amount: formatAmount(Number(asset.amount)),
                type: asset.assetGroup.type === 'sub' ? t('form.debt') : t('form.balance'),
              })}
            </p>
          </div>
        </div>
        <label className="mt-5 block text-[11px] font-extrabold text-ww-mid" htmlFor="asset-adjust-amount">
          {t('adjust.newAmount')}
        </label>
        <div className="mt-2 flex h-[54px] items-center gap-2 rounded-[15px] border border-solid border-border-primary bg-white/80 px-4 shadow-ww-xs focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light/60">
          <span className="font-number text-[16px] font-black text-primary-deep">¥</span>
          <Input
            id="asset-adjust-amount"
            inputMode="decimal"
            placeholder={t('adjust.amountPlaceholder')}
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <Button
          block
          className="mt-5 bg-[linear-gradient(135deg,#50bfd8,#14afc5)] text-white shadow-[0_8px_18px_rgba(20,175,197,0.25)]"
          disabled={!amount}
          loading={mutation.isLoading}
          onClick={() => void handleAdjust()}
        >
          {t('adjust.submit')}
        </Button>
      </div>
    </AppBottomSheet>
  );
};
