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
      <Surface className="mt-[var(--ww-space-md)] overflow-hidden" material="raised">
        <div className="px-[var(--ww-card-padding)] pb-[var(--ww-space-sm)] pt-[var(--ww-space-md)]">
          <div className="flex items-center justify-between gap-[var(--ww-space-md)]">
            <p className="m-0 text-[13px] font-extrabold text-ww-mid">{metricLabel}</p>
            <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-primary-deep">
              {t('records', { count: card.recordCount })}
            </span>
          </div>
          <p className="mb-0 mt-[var(--ww-space-sm)] font-number text-[30px] font-black leading-none tracking-[-0.045em] tabular-nums text-ww-ink">
            ¥
            {card.totalAmount}
          </p>
          {card.category && (
            <span className="mt-[var(--ww-space-md)] inline-flex rounded-[var(--ww-radius-control)] bg-ww-surface-tint px-[var(--ww-space-md)] py-[var(--ww-space-xs)] text-[12px] font-bold text-primary-deep">
              {card.category.name}
            </span>
          )}
          <AgentStatisticChart card={card} />
        </div>
        <div className="border-t border-solid border-border-primary px-[var(--ww-card-padding)] py-[var(--ww-space-sm)]">
          <AppButton disabled={card.recordCount === 0} fullWidth onClick={() => onViewRecords(card)} size="compact" variant="secondary">
            <ReceiptText size={16} />
            {t('viewRecords')}
          </AppButton>
        </div>
      </Surface>
    );
  }

  const isDraft = card.kind === 'RECORD_DRAFT';
  const inactive = isDraft && card.status !== 'PENDING';
  return (
    <Surface className="mt-[var(--ww-space-md)] overflow-hidden px-[var(--ww-card-padding)] py-[var(--ww-space-md)]" material="raised">
      <div className="flex items-center gap-[var(--ww-space-md)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ww-radius-control)] bg-[var(--ww-category-icon-background)] text-[color:var(--ww-category-icon-foreground)]">
          <CategoryIcon categoryName={card.category.name} iconKey={card.category.icon} iconType={card.category.iconType} size={20} />
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
          <p className={`m-0 font-number text-[22px] font-black leading-none tabular-nums ${card.record.type === 'add' ? 'text-finance-income' : 'text-ww-ink'}`}>
            {card.record.type === 'add' ? '+' : '-'}
            ¥
            {card.record.amount}
          </p>
          <p className="mt-1 text-[10px] font-bold text-ww-mid">{t(card.record.type === 'add' ? 'income' : 'expense')}</p>
        </div>
      </div>
      {isDraft && !inactive && (
        <div className="mt-[var(--ww-space-md)] grid grid-cols-2 gap-[var(--ww-space-sm)]">
          <AppButton fullWidth loading={isConfirming} onClick={() => onConfirmDraft(card)} size="compact">
            <Check size={16} />
            {t('confirm')}
          </AppButton>
          <AppButton fullWidth onClick={() => onEditDraft(card)} size="compact" variant="secondary">
            <Pencil size={15} />
            {t('editBeforeConfirm')}
          </AppButton>
          <AppButton className="col-span-2" fullWidth loading={isCancelling} onClick={() => onCancelDraft(card)} size="compact" variant="ghost">
            <X size={15} />
            {t('cancel')}
          </AppButton>
        </div>
      )}
      {isDraft && inactive && (
        <div className="mt-[var(--ww-space-md)] rounded-[var(--ww-radius-control)] bg-ww-surface-tint px-[var(--ww-space-md)] py-[var(--ww-space-sm)] text-center text-[12px] font-bold text-ww-mid">
          {t(card.status === 'CANCELLED' ? 'cancelled' : 'expired')}
        </div>
      )}
      {!isDraft && card.status === 'DELETED' && (
        <div className="mt-[var(--ww-space-md)] rounded-[var(--ww-radius-control)] bg-ww-surface-tint px-[var(--ww-space-md)] py-[var(--ww-space-sm)] text-center text-[12px] font-bold text-ww-mid">
          {t('deletedRecord')}
        </div>
      )}
      {!isDraft && card.status === 'CONFIRMED' && (
        <AppButton className="mt-[var(--ww-space-md)]" fullWidth onClick={() => onEditRecord(card.record.id)} size="compact" variant="secondary">
          <Pencil size={15} />
          {t('editRecord')}
        </AppButton>
      )}
    </Surface>
  );
}
