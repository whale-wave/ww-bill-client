import type { FC } from 'react';
import type { RecordAdjustment, RecordAdjustmentType, RecordEntry } from '@/entities/record';
import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { Banknote, CalendarDays, Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useCreateRecordAdjustmentMutation,
  useDeleteRecordAdjustmentMutation,
  useUpdateRecordAdjustmentMutation,
} from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn, normalizeAmount } from '@/shared/lib';
import { AppBottomSheet, confirmDangerousAction, SheetHeader } from '@/shared/ui';
import './record-adjustment-section.scss';

export interface RecordAdjustmentAssetOption {
  amount: string;
  id: string;
  name: string;
}

interface RecordAdjustmentSectionProps {
  assetOptions?: RecordAdjustmentAssetOption[];
  canManage?: boolean;
  ledgerId?: string;
  record: Pick<RecordEntry, 'adjustments' | 'adjustmentSummary' | 'amount' | 'id' | 'linkedAsset' | 'originalAmount'>;
  supportsAssetLink?: boolean;
}

const adjustmentTypes: RecordAdjustmentType[] = ['refund', 'cashback', 'supplement'];

function toMinorUnits(value: string) {
  const match = value.match(/^(\d+)(?:\.(\d{0,2}))?$/);
  if (!match)
    return;
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
}

function isNegativeAdjustment(
  originalAmount: string,
  adjustments: readonly Pick<RecordAdjustment, 'amount' | 'id' | 'type'>[],
) {
  const original = toMinorUnits(originalAmount);
  if (original === undefined)
    return true;
  const result = adjustments.reduce((total, adjustment) => {
    const amount = toMinorUnits(adjustment.amount);
    if (amount === undefined)
      return Number.NEGATIVE_INFINITY;
    return adjustment.type === 'supplement' ? total + amount : total - amount;
  }, original);
  return result < 0;
}

export const RecordAdjustmentSection: FC<RecordAdjustmentSectionProps> = ({
  assetOptions = [],
  canManage = false,
  ledgerId,
  record,
  supportsAssetLink = false,
}) => {
  const { t } = useTranslation('record');
  const [createAdjustment, createState] = useCreateRecordAdjustmentMutation();
  const [updateAdjustment, updateState] = useUpdateRecordAdjustmentMutation();
  const [deleteAdjustment, deleteState] = useDeleteRecordAdjustmentMutation();
  const [editing, setEditing] = useState<RecordAdjustment>();
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState<RecordAdjustmentType>('refund');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [remark, setRemark] = useState('');
  const [assetId, setAssetId] = useState<string | null>();
  const adjustments = record.adjustments ?? [];
  const originalAmount = record.originalAmount
    ?? record.adjustmentSummary?.originalAmount
    ?? record.amount;
  const isSaving = createState.isLoading || updateState.isLoading;
  const isReadOnly = !canManage || editing?.canManage === false;
  const candidateAdjustment = { amount, id: editing?.id ?? 'new', type };
  const candidateAdjustments = !amount
    ? adjustments
    : editing
      ? adjustments.map(item => item.id === editing.id ? candidateAdjustment : item)
      : [...adjustments, candidateAdjustment];
  const isInvalidAmount = !amount
    || toMinorUnits(amount) === undefined
    || toMinorUnits(amount) === 0
    || isNegativeAdjustment(originalAmount, candidateAdjustments);

  const closeSheet = () => {
    if (isSaving)
      return;
    setIsVisible(false);
    setEditing(undefined);
  };

  const openCreate = () => {
    setEditing(undefined);
    setType('refund');
    setAmount('');
    setOccurredAt(new Date());
    setRemark('');
    setAssetId(record.linkedAsset?.id);
    setIsVisible(true);
  };

  const openEdit = (adjustment: RecordAdjustment) => {
    setEditing(adjustment);
    setType(adjustment.type);
    setAmount(adjustment.amount);
    setOccurredAt(new Date(adjustment.occurredAt));
    setRemark(adjustment.remark);
    setAssetId(adjustment.linkedAsset?.id ?? null);
    setIsVisible(true);
  };

  const handleSubmit = async () => {
    if (isSaving || isInvalidAmount)
      return;
    const data = {
      amount,
      ...(supportsAssetLink && assetId !== undefined ? { linkedAssetId: assetId } : {}),
      occurredAt: occurredAt.toISOString(),
      remark: remark.trim(),
      type,
    };
    try {
      if (editing) {
        await updateAdjustment({
          adjustmentId: editing.id,
          data: { ...data, version: editing.version },
          ledgerId,
          recordId: String(record.id),
        });
      }
      else {
        await createAdjustment({ data, ledgerId, recordId: String(record.id) });
      }
      setIsVisible(false);
      setEditing(undefined);
      Toast.show({ content: t('adjustment.saved'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('adjustment.failed'), icon: 'fail' });
    }
  };

  const handleDelete = async () => {
    if (!editing || deleteState.isLoading)
      return;
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('adjustment.delete'),
      description: t('adjustment.deleteDescription'),
      title: t('adjustment.deleteTitle'),
    });
    if (!confirmed)
      return;
    try {
      await deleteAdjustment({
        adjustmentId: editing.id,
        ledgerId,
        recordId: String(record.id),
        version: editing.version,
      });
      setIsVisible(false);
      setEditing(undefined);
      Toast.show({ content: t('adjustment.deleted'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('adjustment.failed'), icon: 'fail' });
    }
  };

  return (
    <section className="mt-4" data-record-adjustments>
      <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <span className="min-w-0">
          <h2 className="text-[14px] font-extrabold text-ww-ink">{t('adjustment.title')}</h2>
          <p className="mt-0.5 text-[10px] leading-4 text-ww-soft">{t('adjustment.description')}</p>
        </span>
        {canManage && (
          <button
            className="flex h-11 shrink-0 items-center gap-1 rounded-full border border-solid border-border-primary bg-white/85 px-3 text-[11px] font-extrabold text-primary-deep shadow-ww-xs"
            onClick={openCreate}
            type="button"
          >
            <Plus size={14} strokeWidth={2.2} />
            {t('adjustment.add')}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-solid border-border-primary bg-ww-surface-raised">
        {record.adjustmentSummary && (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-0 border-b border-solid border-border-primary px-4 py-3">
            <span>
              <span className="block text-[10px] font-semibold text-ww-soft">{t('adjustment.originalAmount')}</span>
              <span className="font-number text-[16px] font-black text-ww-mid">
                ¥
                {record.adjustmentSummary.originalAmount}
              </span>
            </span>
            <RotateCcw className="text-primary-deep" size={17} strokeWidth={1.9} />
            <span className="text-right">
              <span className="block text-[10px] font-semibold text-ww-soft">{t('adjustment.adjustedAmount')}</span>
              <span className="font-number text-[18px] font-black text-finance-expense">
                ¥
                {record.adjustmentSummary.adjustedAmount}
              </span>
            </span>
          </div>
        )}
        {adjustments.length
          ? adjustments.map(adjustment => (
              <button
                className="flex min-h-[68px] w-full items-center gap-3 border-0 border-t border-solid border-border-primary bg-transparent px-4 py-3 text-left first:border-0 disabled:cursor-default"
                key={adjustment.id}
                onClick={() => openEdit(adjustment)}
                type="button"
              >
                <span className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]',
                  adjustment.type === 'supplement'
                    ? 'bg-finance-expense/10 text-finance-expense'
                    : 'bg-finance-income/10 text-finance-income',
                )}
                >
                  <RotateCcw size={17} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-extrabold text-ww-ink">{t(`adjustment.${adjustment.type}`)}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-ww-soft">
                    {dayjs(adjustment.occurredAt).format('YYYY/MM/DD HH:mm')}
                    {adjustment.remark ? ` · ${adjustment.remark}` : ''}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-ww-soft">
                    {adjustment.createdBy.name ?? adjustment.createdBy.username ?? `#${adjustment.createdBy.id}`}
                    {adjustment.linkedAsset ? ` · ${adjustment.linkedAsset.name}` : ''}
                  </span>
                </span>
                <span className={cn(
                  'font-number text-[15px] font-black',
                  adjustment.type === 'supplement' ? 'text-finance-expense' : 'text-finance-income',
                )}
                >
                  {adjustment.type === 'supplement' ? '+' : '-'}
                  ¥
                  {adjustment.amount}
                </span>
              </button>
            ))
          : <div className="px-4 py-5 text-center text-[11px] font-semibold text-ww-soft">{t('adjustment.empty')}</div>}
      </div>

      <AppBottomSheet
        bodyClassName="record-adjustment-sheet flex max-h-[88vh] flex-col overflow-hidden"
        destroyOnClose
        onClose={closeSheet}
        onMaskClick={closeSheet}
        position="bottom"
        visible={isVisible}
      >
        <SheetHeader
          closeLabel={t('common:nav.close')}
          description={t('adjustment.description')}
          icon={<RotateCcw size={20} strokeWidth={1.9} />}
          onClose={closeSheet}
          title={editing
            ? isReadOnly ? t('adjustment.detail') : t('adjustment.edit')
            : t('adjustment.add')}
        />
        <div className="min-h-0 flex-1 overflow-auto px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
          <div className="grid grid-cols-3 gap-1 rounded-[17px] bg-ww-surface-tint p-1">
            {adjustmentTypes.map((option) => {
              const isSelected = type === option;
              const selectedClassName = option === 'supplement'
                ? 'border-finance-expense/40 bg-finance-expense/10 text-finance-expense shadow-ww-xs'
                : 'border-finance-income/40 bg-finance-income/10 text-finance-income shadow-ww-xs';

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-11 items-center justify-center gap-1 rounded-[13px] border border-solid text-[12px] font-extrabold transition-[background-color,border-color,color,box-shadow,transform] active:scale-[0.98] disabled:cursor-default disabled:opacity-70',
                    isSelected
                      ? selectedClassName
                      : 'border-transparent bg-transparent text-ww-mid',
                  )}
                  key={option}
                  disabled={isReadOnly}
                  onClick={() => setType(option)}
                  type="button"
                >
                  {isSelected && <Check aria-hidden="true" size={13} strokeWidth={2.6} />}
                  {t(`adjustment.${option}`)}
                </button>
              );
            })}
          </div>

          {editing && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] bg-ww-surface-muted px-3 py-2.5 text-[11px]">
              <span className="font-semibold text-ww-soft">{t('adjustment.createdBy')}</span>
              <span className="truncate font-extrabold text-ww-ink">
                {editing.createdBy.name ?? editing.createdBy.username ?? `#${editing.createdBy.id}`}
              </span>
            </div>
          )}

          <label className="mt-4 block text-[11px] font-bold text-ww-mid" htmlFor="record-adjustment-amount">{t('adjustment.amount')}</label>
          <div className="mt-1.5 flex h-[54px] items-center gap-2 rounded-[16px] border border-solid border-border-primary bg-ww-surface-raised px-4 shadow-ww-xs transition-[border-color,box-shadow] focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light/60">
            <span className="font-number text-[20px] font-black text-primary-deep">¥</span>
            <input
              className="record-adjustment-sheet__amount-input ww-sheet-plain-input min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-number text-[24px] font-black text-ww-ink outline-none"
              id="record-adjustment-amount"
              inputMode="decimal"
              readOnly={isReadOnly}
              onChange={event => setAmount(current => normalizeAmount(event.target.value, current))}
              placeholder="0.00"
              value={amount}
            />
          </div>
          {amount && isNegativeAdjustment(originalAmount, candidateAdjustments) && (
            <p className="mt-1.5 text-[10px] font-semibold text-finance-expense">{t('adjustment.negative')}</p>
          )}

          <button
            className="mt-4 flex h-[50px] w-full items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white px-4 text-left"
            onClick={async () => {
              if (isReadOnly)
                return;
              const value = await DatePicker.prompt({
                defaultValue: occurredAt,
                precision: 'minute',
                title: t('adjustment.occurredAt'),
              });
              if (value)
                setOccurredAt(value);
            }}
            type="button"
          >
            <CalendarDays className="text-primary-deep" size={17} />
            <span className="flex-1 text-[12px] font-bold text-ww-mid">{t('adjustment.occurredAt')}</span>
            <span className="font-number text-[12px] font-extrabold text-ww-ink">{dayjs(occurredAt).format('YYYY/MM/DD HH:mm')}</span>
          </button>

          {supportsAssetLink && (
            <div className="mt-4">
              <p className="text-[11px] font-bold text-ww-mid">{t('adjustment.asset')}</p>
              <div className="mt-1.5 overflow-hidden rounded-[16px] border border-solid border-border-primary bg-white">
                <button
                  aria-pressed={assetId === null}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 border-0 px-4 text-left transition-colors',
                    assetId === null ? 'bg-action-primary/10' : 'bg-transparent',
                  )}
                  disabled={isReadOnly}
                  onClick={() => setAssetId(null)}
                  type="button"
                >
                  <Banknote className={assetId === null ? 'text-action-primary' : 'text-ww-soft'} size={16} />
                  <span className="flex-1 text-[12px] font-bold text-ww-mid">{t('adjustment.noAsset')}</span>
                  {assetId === null && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-action-primary text-action-primary-foreground">
                      <Check aria-hidden="true" size={12} strokeWidth={2.8} />
                    </span>
                  )}
                </button>
                {assetOptions.map(option => (
                  <button
                    aria-pressed={assetId === option.id}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 border-0 border-t border-solid border-border-primary px-4 text-left transition-colors',
                      assetId === option.id ? 'bg-action-primary/10' : 'bg-transparent',
                    )}
                    key={option.id}
                    disabled={isReadOnly}
                    onClick={() => setAssetId(option.id)}
                    type="button"
                  >
                    <Banknote className={assetId === option.id ? 'text-action-primary' : 'text-ww-soft'} size={16} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-extrabold text-ww-ink">{option.name}</span>
                      <span className="font-number text-[10px] font-semibold text-ww-soft">
                        ¥
                        {option.amount}
                      </span>
                    </span>
                    {assetId === option.id && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-action-primary text-action-primary-foreground">
                        <Check aria-hidden="true" size={12} strokeWidth={2.8} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="mt-4 block text-[11px] font-bold text-ww-mid" htmlFor="record-adjustment-remark">{t('adjustment.remark')}</label>
          <textarea
            className="mt-1.5 min-h-[76px] w-full resize-none rounded-[16px] border border-solid border-border-primary bg-white p-3 text-[13px] text-ww-ink outline-none"
            id="record-adjustment-remark"
            maxLength={500}
            onChange={event => setRemark(event.target.value)}
            placeholder={t('adjustment.remarkPlaceholder')}
            readOnly={isReadOnly}
            value={remark}
          />

          {!isReadOnly && (
            <button
              className="mt-5 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
              disabled={isInvalidAmount || isSaving}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {isSaving ? t('adjustment.saving') : t('adjustment.save')}
            </button>
          )}
          {editing && !isReadOnly && (
            <button
              className="mt-2 flex h-11 w-full items-center justify-center gap-1 border-0 bg-transparent text-[12px] font-extrabold text-finance-expense disabled:opacity-45"
              disabled={deleteState.isLoading}
              onClick={() => void handleDelete()}
              type="button"
            >
              <Trash2 size={14} />
              {t('adjustment.delete')}
            </button>
          )}
        </div>
      </AppBottomSheet>
    </section>
  );
};
