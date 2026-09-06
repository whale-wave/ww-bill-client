import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeftRight, CalendarDays, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGetAssetQuery, usePostAssetTransferMutation } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { normalizeAmount } from '@/shared/lib';
import { AppBottomSheet, SheetHeader } from '@/shared/ui';

interface AssetTransferPopupProps {
  asset: Asset;
  onClose: () => void;
  visible: boolean;
}

export const AssetTransferPopup: FC<AssetTransferPopupProps> = ({ asset, onClose, visible }) => {
  const { t } = useTranslation('asset');
  const assetsQuery = useGetAssetQuery({ queryOptions: { enabled: visible } });
  const [createTransfer, mutation] = usePostAssetTransferMutation();
  const [targetAssetId, setTargetAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const targets = useMemo(
    () => assetsQuery.data.filter(item => item.id !== asset.id),
    [asset.id, assetsQuery.data],
  );
  const target = targets.find(item => item.id === targetAssetId);

  const handleSubmit = async () => {
    if (!target || !amount || mutation.isLoading)
      return;
    try {
      await createTransfer({
        amount,
        idempotencyKey: crypto.randomUUID(),
        occurredAt: occurredAt.toISOString(),
        sourceAssetId: asset.id,
        targetAssetId: target.id,
      });
      setAmount('');
      setTargetAssetId('');
      onClose();
      Toast.show({ content: t('transfer.success'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('transfer.failed'), icon: 'fail' });
    }
  };

  return (
    <AppBottomSheet
      bodyClassName="flex max-h-[86vh] flex-col overflow-hidden rounded-t-[24px] bg-white"
      destroyOnClose
      onClose={onClose}
      onMaskClick={onClose}
      position="bottom"
      visible={visible}
    >
      <SheetHeader
        closeLabel={t('common:nav.close')}
        description={t('transfer.description')}
        icon={<ArrowLeftRight size={20} strokeWidth={1.9} />}
        onClose={onClose}
        title={t('transfer.title')}
      />
      <div className="overflow-auto px-5 pb-[calc(22px+env(safe-area-inset-bottom))] pt-4">
        <p className="text-[11px] font-extrabold text-ww-mid">{t('transfer.source')}</p>
        <div className="mt-2 flex min-h-[62px] items-center rounded-[16px] border border-border-primary bg-primary-light/25 px-4">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-black text-ww-ink">{asset.name}</span>
            <span className="text-[11px] font-semibold text-ww-soft">
              ¥
              {asset.amount}
            </span>
          </span>
        </div>

        <label className="mt-4 block text-[11px] font-extrabold text-ww-mid" htmlFor="asset-transfer-target">{t('transfer.target')}</label>
        <div className="relative mt-2">
          <select
            className="h-[56px] w-full appearance-none rounded-[16px] border border-border-primary bg-white px-4 pr-11 text-[14px] font-bold text-ww-ink outline-none"
            id="asset-transfer-target"
            onChange={event => setTargetAssetId(event.target.value)}
            value={targetAssetId}
          >
            <option value="">{t('transfer.selectTarget')}</option>
            {targets.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
                {' '}
                · ¥
                {item.amount}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ww-soft" size={18} />
        </div>

        <label className="mt-4 block text-[11px] font-extrabold text-ww-mid" htmlFor="asset-transfer-amount">{t('transfer.amount')}</label>
        <div className="mt-2 flex h-[56px] items-center gap-2 rounded-[16px] border border-border-primary bg-white px-4 focus-within:border-primary">
          <span className="font-number text-primary-deep">¥</span>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent font-number text-[20px] font-black text-ww-ink outline-none"
            id="asset-transfer-amount"
            inputMode="decimal"
            onChange={event => setAmount(current => normalizeAmount(event.target.value, current))}
            placeholder="0.00"
            value={amount}
          />
        </div>

        <button
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-border-primary bg-white text-[13px] font-bold text-ww-mid"
          onClick={async () => {
            const value = await DatePicker.prompt({ defaultValue: occurredAt, precision: 'minute', title: t('transfer.date') });
            if (value)
              setOccurredAt(value);
          }}
          type="button"
        >
          <CalendarDays size={16} />
          {dayjs(occurredAt).format('YYYY/MM/DD HH:mm')}
        </button>

        <button
          className="mt-5 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
          disabled={!target || !amount || Number(amount) <= 0 || mutation.isLoading}
          onClick={() => void handleSubmit()}
          type="button"
        >
          {mutation.isLoading ? t('transfer.submitting') : t('transfer.submit')}
        </button>
      </div>
    </AppBottomSheet>
  );
};
