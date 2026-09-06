import type { AgentCard, AgentRecordDraftCard } from '@/entities/agent';
import dayjs from 'dayjs';
import { Check, Pencil, ReceiptText, X } from 'lucide-react';
import { CategoryIcon } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { AppButton, Surface } from '@/shared/ui';
import { AgentStatisticChart } from './AgentStatisticChart';

interface AgentCardViewProps {
  card: AgentCard;
  isCancelling?: boolean;
  isConfirming?: boolean;
  onCancelDraft: (card: AgentRecordDraftCard) => void;
  onConfirmDraft: (card: AgentRecordDraftCard) => void;
  onEditDraft: (card: AgentRecordDraftCard) => void;
  onEditRecord: (recordId: number) => void;
  onViewRecords: (card: Extract<AgentCard, { kind: 'STATISTIC' }>) => void;
}

export function AgentCardView({
  card,
  isCancelling,
  isConfirming,
  onCancelDraft,
  onConfirmDraft,
  onEditDraft,
  onEditRecord,
  onViewRecords,
}: AgentCardViewProps) {
  const { t } = useTranslation('agent');

  if (card.kind === 'STATISTIC') {
    const metricLabel = t(card.metric);
    return (
      <Surface className="mt-3 overflow-hidden rounded-[22px] p-4" material="raised">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-[12px] font-bold text-ww-mid">{metricLabel}</p>
            <p className="mt-1 text-[28px] font-black tracking-[-0.04em] text-ww-ink">
              ¥
              {card.totalAmount}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-extrabold text-primary-deep">
            {t('records', { count: card.recordCount })}
          </span>
        </div>
        {card.category && <p className="mt-2 text-[12px] font-semibold text-ww-mid">{card.category.name}</p>}
        <AgentStatisticChart card={card} />
        <AppButton className="mt-3 h-11" disabled={card.recordCount === 0} fullWidth onClick={() => onViewRecords(card)} variant="secondary">
          <ReceiptText size={16} />
          {t('viewRecords')}
        </AppButton>
      </Surface>
    );
  }

  const isDraft = card.kind === 'RECORD_DRAFT';
  const inactive = isDraft && card.status !== 'PENDING';
  return (
    <Surface className="mt-3 overflow-hidden rounded-[22px] p-4" material="raised">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-deep">
          <CategoryIcon categoryName={card.category.name} iconKey={card.category.icon} size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[14px] font-extrabold text-ww-ink">
            {card.category.name}
            {' '}
            ·
            {' '}
            {card.record.remark}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-ww-mid">{dayjs(card.record.time).format('MM月DD日 HH:mm')}</p>
        </div>
        <div className="text-right">
          <p className={`m-0 text-[20px] font-black ${card.record.type === 'add' ? 'text-feedback-success' : 'text-ww-ink'}`}>
            {card.record.type === 'add' ? '+' : '-'}
            ¥
            {card.record.amount}
          </p>
          <p className="mt-1 text-[10px] font-bold text-ww-mid">{t(card.record.type === 'add' ? 'income' : 'expense')}</p>
        </div>
      </div>
      {isDraft && !inactive && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <AppButton className="h-11" loading={isConfirming} onClick={() => onConfirmDraft(card)}>
            <Check size={16} />
            {t('confirm')}
          </AppButton>
          <AppButton className="h-11" onClick={() => onEditDraft(card)} variant="secondary">
            <Pencil size={15} />
            {t('editBeforeConfirm')}
          </AppButton>
          <AppButton className="col-span-2 h-11" loading={isCancelling} onClick={() => onCancelDraft(card)} variant="ghost">
            <X size={15} />
            {t('cancel')}
          </AppButton>
        </div>
      )}
      {isDraft && inactive && (
        <div className="mt-4 rounded-xl bg-ww-surface px-3 py-2 text-center text-[12px] font-bold text-ww-mid">
          {t(card.status === 'CANCELLED' ? 'cancelled' : 'expired')}
        </div>
      )}
      {!isDraft && (
        <AppButton className="mt-4 h-11" fullWidth onClick={() => onEditRecord(card.record.id)} variant="secondary">
          <Pencil size={15} />
          {t('editRecord')}
        </AppButton>
      )}
    </Surface>
  );
}
