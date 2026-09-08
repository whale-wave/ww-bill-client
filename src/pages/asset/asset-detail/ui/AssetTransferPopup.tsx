import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { ArrowLeftRight, Banknote, CalendarDays, Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAssetAccountTypeLabel, useGetAssetGroupQuery, useGetAssetQuery, usePostAssetTransferMutation } from '@/entities/asset';
import { useTranslation } from '@/shared/i18n';
import { cn, normalizeAmount } from '@/shared/lib';
import { AppSheet, promptAppDatePicker, SheetHeader } from '@/shared/ui';
import './AssetTransferPopup.scss';

interface AssetTransferPopupProps {
  asset: Asset;
  onClose: () => void;
  visible: boolean;
}

const AssetTransferContent: FC<AssetTransferPopupProps> = ({ asset, onClose, visible }) => {
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
  const sourceTypeLabel = getAssetAccountTypeLabel(asset, assetGroupsQuery.data);
  const targetTypeLabel = target ? getAssetAccountTypeLabel(target, assetGroupsQuery.data) : '';

  const handleClose = () => {
    setIsTargetPickerVisible(false);
    onClose();
  };

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
      handleClose();
      Toast.show({ content: t('transfer.success'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('transfer.failed'), icon: 'fail' });
    }
  };

  return (
    <>
      <div className="t-panel-slide flex min-h-0 flex-1 flex-col" data-open={visible}>
        <SheetHeader
          closeLabel={t('common:nav.close')}
          description={t('transfer.description')}
          icon={<ArrowLeftRight size={20} strokeWidth={1.9} />}
          onClose={handleClose}
          title={t('transfer.title')}
        />
        <div className="asset-transfer-sheet__content overflow-auto">
          <p className="asset-transfer-sheet__label">{t('transfer.source')}</p>
          <div className="asset-transfer-sheet__account-summary">
            <span className="asset-transfer-sheet__icon">
              <Banknote aria-hidden="true" size={18} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-black text-ww-ink">{asset.name}</span>
              <span className="mt-0.5 block truncate font-number text-[11px] font-semibold text-ww-mid">
                {sourceTypeLabel}
                {' · ¥'}
                {asset.amount}
              </span>
            </span>
          </div>

          <label className="asset-transfer-sheet__label" htmlFor="asset-transfer-target">{t('transfer.target')}</label>
          <button
            aria-expanded={isTargetPickerVisible}
            aria-haspopup="dialog"
            className="asset-transfer-sheet__control asset-transfer-sheet__control--select"
            data-asset-transfer-target-trigger
            id="asset-transfer-target"
            onClick={() => setIsTargetPickerVisible(true)}
            type="button"
          >
            <span className="asset-transfer-sheet__control-icon">
              <Banknote aria-hidden="true" size={17} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn(
                'block truncate text-[14px] font-extrabold',
                target ? 'text-ww-ink' : 'text-ww-mid',
              )}
              >
                {target?.name ?? t('transfer.selectTarget')}
              </span>
              {target && (
                <span className="mt-0.5 block truncate font-number text-[11px] font-semibold text-ww-mid">
                  {targetTypeLabel}
                  {' · ¥'}
                  {target.amount}
                </span>
              )}
            </span>
            <ChevronDown aria-hidden="true" className="asset-transfer-sheet__chevron shrink-0" size={18} />
          </button>

          <label className="asset-transfer-sheet__label" htmlFor="asset-transfer-amount">{t('transfer.amount')}</label>
          <div className="asset-transfer-sheet__control asset-transfer-sheet__control--amount">
            <span className="font-number text-primary-deep">¥</span>
            <input
              className="ww-sheet-plain-input min-w-0 flex-1 border-0 bg-transparent p-0 font-number text-[20px] font-black text-ww-ink outline-none"
              id="asset-transfer-amount"
              inputMode="decimal"
              onChange={event => setAmount(current => normalizeAmount(event.target.value, current))}
              placeholder="0.00"
              value={amount}
            />
          </div>

          <button
            className="asset-transfer-sheet__date"
            onClick={async () => {
              const value = await promptAppDatePicker({ defaultValue: occurredAt, precision: 'minute', title: t('transfer.date') });
              if (value)
                setOccurredAt(value);
            }}
            type="button"
          >
            <CalendarDays aria-hidden="true" size={16} />
            <span className="font-number">{dayjs(occurredAt).format('YYYY/MM/DD HH:mm')}</span>
          </button>

          <button
            className="asset-transfer-sheet__submit"
            disabled={!target || !amount || Number(amount) <= 0 || mutation.isLoading}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {mutation.isLoading ? t('transfer.submitting') : t('transfer.submit')}
          </button>
        </div>
      </div>

      <AppSheet
        bodyClassName="asset-transfer-picker flex max-h-[62vh] flex-col overflow-hidden"
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
        <div className="asset-transfer-picker__content overflow-auto">
          <div className="asset-transfer-picker__list">
            {targets.map((item) => {
              const isSelected = item.id === targetAssetId;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'asset-transfer-picker__option',
                    isSelected && 'asset-transfer-picker__option--selected',
                  )}
                  data-asset-transfer-target-option={item.id}
                  key={item.id}
                  onClick={() => {
                    setTargetAssetId(item.id);
                    setIsTargetPickerVisible(false);
                  }}
                  type="button"
                >
                  <span className="asset-transfer-sheet__icon">
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
                  <span className={cn('asset-transfer-picker__check', isSelected && 'asset-transfer-picker__check--visible')}>
                    <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </AppSheet>
    </>
  );
};

export const AssetTransferPopup: FC<AssetTransferPopupProps> = ({ asset, onClose, visible }) => {
  const [hasOpened, setHasOpened] = useState(visible);

  return (
    <AppSheet
      afterClose={() => setHasOpened(false)}
      afterShow={() => setHasOpened(true)}
      bodyClassName="asset-transfer-sheet flex max-h-[86vh] flex-col overflow-hidden"
      onClose={onClose}
      onMaskClick={onClose}
      position="bottom"
      visible={visible}
    >
      {(visible || hasOpened) && (
        <AssetTransferContent asset={asset} onClose={onClose} visible={visible} />
      )}
    </AppSheet>
  );
};
