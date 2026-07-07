import type { PopupProps } from 'antd-mobile';
import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Button, Input, Popup } from 'antd-mobile';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatchAssetAdjustMutation } from '@/entities/asset';
import { isSuccessApi } from '@/shared/api';
import { normalizeAmount } from '@/shared/lib';

export interface AssetAdjustPopupProps extends PopupProps {
  onMaskClick?: () => void;
  onClose: () => void;
  asset: Asset;
}

export const AssetAdjustPopup: FC<AssetAdjustPopupProps> = (props) => {
  const { visible, onClose, asset } = props;
  const { t } = useTranslation('asset');
  const [amount, setAmount] = useState<string>('');
  const prevAmountRef = useRef<string>('');
  const [patchAssetAdjustMutate] = usePatchAssetAdjustMutation();

  useEffect(() => {
    prevAmountRef.current = amount;
  }, [amount]);

  const handleAmountChange = useCallback((value: string) => {
    const normalizedAmount = normalizeAmount(value, prevAmountRef.current);

    setAmount(normalizedAmount);
  }, []);

  const handleAdjust = useCallback(async () => {
    const res = await patchAssetAdjustMutate({
      id: asset.id,
      data: {
        amount,
      },
    });
    if (isSuccessApi(res)) {
      setAmount('');
      onClose();
    }
  }, [asset, amount]);

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      showCloseButton
      onClose={onClose}
    >
      <div className="flex justify-center items-center py-3 text-base">
        {t('adjust.current')}
        {asset.assetGroup.type === 'sub' ? t('form.debt') : t('form.balance')}
      </div>
      <div className="px-6 mt-5">
        <div className="bg-[#F5F5F5] py-2 px-4 rounded-lg">
          <Input placeholder={t('adjust.amountPlaceholder')} clearable value={amount} onChange={handleAmountChange} />
        </div>
      </div>
      <div className="px-20 mt-8 pb-10">
        <Button className="mt-5" shape="rounded" size="large" block color="primary" disabled={!amount} onClick={handleAdjust}>
          {t('adjust.submit')}
        </Button>
      </div>
    </Popup>
  );
};
