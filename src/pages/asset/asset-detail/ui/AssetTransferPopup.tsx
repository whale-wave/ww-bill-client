import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeftRight, Banknote, CalendarDays, Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAssetAccountTypeLabel, useGetAssetGroupQuery, useGetAssetQuery, usePostAssetTransferMutation } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { cn, normalizeAmount } from '@/shared/lib';
import { AppBottomSheet, SheetHeader } from '@/shared/ui';

interface AssetTransferPopupProps {
  asset: Asset;
  onClose: () => void;
  visible: boolean;
}

export const AssetTransferPopup: FC<AssetTransferPopupProps> = ({ asset, onClose, visible }) => {
  const { t } = useTranslation('asset');
  const assetsQuery = useGetAssetQuery({ queryOptions: { enabled: visible } });
  const assetGroupsQuery = useGetAssetGroupQuery({ queryOptions: { enabled: visible } });
  const [createTransfer, mutation] = usePostAssetTransferMutation();
  const [targetAssetId, setTargetAssetId] = useState('');
  const [isTargetPickerVisible, setIsTargetPickerVisible] = useState(false);
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
        <div className="mt-2 flex min-h-[62px] items-center gap-3 rounded-[16px] bg-surface-subtle px-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
            <Banknote aria-hidden="true" size={18} strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-black text-ww-ink">{asset.name}</span>
            <span className="text-[11px] font-semibold text-ww-soft">
              ¥
              {asset.amount}
            </span>
          </span>
        </div>

        <label className="mt-4 block text-[11px] font-extrabold text-ww-mid" htmlFor="asset-transfer-target">{t('transfer.target')}</label>
        <button
          aria-expanded={isTargetPickerVisible}
          aria-haspopup="dialog"
          className="mt-2 flex min-h-[56px] w-full items-center gap-3 rounded-[16px] border border-transparent bg-white px-4 text-left shadow-ww-xs transition-colors active:bg-primary-light/25 focus-visible:border-primary"
          data-asset-transfer-target-trigger
          id="asset-transfer-target"
          onClick={() => setIsTargetPickerVisible(true)}
          type="button"
        >
          <span className="min-w-0 flex-1">
            <span className={cn(
              'block truncate text-[14px] font-extrabold',
              target ? 'text-ww-ink' : 'text-ww-mid',
            )}
            >
              {target?.name ?? t('transfer.selectTarget')}
            </span>
            {target && (
              <span className="mt-0.5 block truncate font-number text-[11px] font-semibold text-ww-soft">
                ¥
                {target.amount}
              </span>
            )}
          </span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-ww-soft" size={18} />
        </button>

        <label className="mt-4 block text-[11px] font-extrabold text-ww-mid" htmlFor="asset-transfer-amount">{t('transfer.amount')}</label>
        <div className="mt-2 flex h-[56px] items-center gap-2 rounded-[16px] border border-transparent bg-white px-4 shadow-ww-xs transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light/60">
          <span className="font-number text-primary-deep">¥</span>
          <input
            className="ww-sheet-plain-input min-w-0 flex-1 border-0 bg-transparent p-0 font-number text-[20px] font-black text-ww-ink outline-none placeholder:text-ww-soft"
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

      <AppBottomSheet
        bodyClassName="flex max-h-[62vh] flex-col overflow-hidden rounded-t-[24px] bg-white/95 backdrop-blur-xl"
        destroyOnClose
        onClose={() => setIsTargetPickerVisible(false)}
        onMaskClick={() => setIsTargetPickerVisible(false)}
        position="bottom"
        visible={isTargetPickerVisible}
      >
        <SheetHeader
          closeLabel={t('common:nav.close')}
          onClose={() => setIsTargetPickerVisible(false)}
          title={t('transfer.selectTarget')}
        />
        <div className="space-y-2 overflow-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
          {targets.map((item) => {
            const isSelected = item.id === targetAssetId;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-[64px] w-full items-center gap-3 rounded-[16px] border bg-white px-3 text-left transition-colors active:bg-primary-light/25 focus-visible:border-primary',
                  isSelected ? 'border-primary' : 'border-transparent',
                )}
                data-asset-transfer-target-option={item.id}
                key={item.id}
                onClick={() => {
                  setTargetAssetId(item.id);
                  setIsTargetPickerVisible(false);
                }}
                type="button"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
                  <Banknote aria-hidden="true" size={18} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-ww-ink">{item.name}</span>
                  <span className="block truncate text-[11px] font-semibold text-ww-soft">
                    {getAssetAccountTypeLabel(item, assetGroupsQuery.data)}
                  </span>
                </span>
                <span className="shrink-0 font-number text-[13px] font-bold text-ww-mid">
                  ¥
                  {item.amount}
                </span>
                {isSelected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                    <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </AppBottomSheet>
    </AppBottomSheet>
  );
};
