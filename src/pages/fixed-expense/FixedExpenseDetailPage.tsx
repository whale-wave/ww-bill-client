import { Skeleton } from 'antd-mobile';
import { CalendarClock, FileWarning } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FixedExpenseCycle, useGetFixedExpenseByIdQuery } from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { IllustratedEmptyState, PageHeader, Surface } from '@/shared/ui';
import {
  getCurrencyLabelMap,
  getCycleLabelMap,
  getPriorityLabelMap,
  getStatusLabelMap,
  getTypeLabelMap,
  statusColorMap,
  typeIconMap,
} from './constants';
import { EditAndDeleteButton } from './ui';
import { formatAmountWithCurrency, formatDate, formatNextBillingDate } from './utils';

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex min-h-[56px] items-center justify-between border-0 border-b border-solid border-border-primary py-2.5 last:border-b-0">
    <span className="text-[11px] font-bold text-ww-soft">{label}</span>
    <span className="ml-3 max-w-[62%] break-words text-right text-[13px] font-bold leading-5 text-ww-ink">
      {value || <span className="text-ww-ghost">--</span>}
    </span>
  </div>
);

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <Surface className={cn('px-4 py-3', className)} material="content">
    {title && (
      <div className="pb-2 text-[12px] font-extrabold text-ww-ink">{title}</div>
    )}
    <div>{children}</div>
  </Surface>
);

const FixedExpenseDetail: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const query = useGetFixedExpenseByIdQuery({ params: { id } });
  const detail = query.data;

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const statusColor = useMemo(
    () => (detail ? statusColorMap[detail.status] : undefined),
    [detail],
  );
  const TypeIcon = detail ? typeIconMap[detail.type] : undefined;
  const currencyLabels = getCurrencyLabelMap();
  const cycleLabels = getCycleLabelMap();
  const priorityLabels = getPriorityLabelMap();
  const statusLabels = getStatusLabelMap();
  const typeLabels = getTypeLabelMap();

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('detail.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-6 pt-2">
        <div className="mx-auto w-full max-w-[520px] space-y-3">
          {query.isLoading
            ? (
                <Surface className="p-5" material="content">
                  <Skeleton.Title animated />
                  <Skeleton.Paragraph animated lineCount={6} />
                </Surface>
              )
            : query.isError || !detail
              ? (
                  <Surface material="content">
                    <IllustratedEmptyState
                      actionLabel={query.isError ? t('retry') : undefined}
                      description={query.isError ? t('loadErrorDescription') : t('detail.noFixedExpenseInfo')}
                      icon={<FileWarning className="text-primary-deep" size={40} strokeWidth={1.6} />}
                      onAction={query.isError ? () => void query.refetch() : undefined}
                      title={query.isError ? t('loadError') : t('detail.noFixedExpenseInfo')}
                    />
                  </Surface>
                )
              : (
                  <>
                    <Surface className="relative overflow-hidden px-5 py-5" material="raised">
                      <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[20px] border-solid border-white/25" />
                      <div className="relative flex items-center gap-3 text-ww-ink">
                        {TypeIcon && (
                          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px] bg-white/75 text-primary-deep shadow-ww-xs">
                            <TypeIcon size={23} strokeWidth={1.8} />
                          </span>
                        )}
                        <span className="min-w-0 truncate text-[15px] font-extrabold">{detail.name}</span>
                        {statusColor && (
                          <span className="ml-auto inline-flex shrink-0 items-center space-x-1 rounded-full bg-white/65 px-2.5 py-1 text-[9px] font-bold text-ww-mid backdrop-blur">
                            <span className={cn('h-1.5 w-1.5 rounded-full', statusColor.dot)} />
                            <span>{statusLabels[detail.status]}</span>
                          </span>
                        )}
                      </div>
                      <div className="relative mt-4 flex items-baseline space-x-1 text-ww-ink">
                        <span className="text-[28px] font-black leading-none tracking-[-0.5px]">
                          {formatAmountWithCurrency(detail.amount, detail.currency)}
                        </span>
                        <span className="text-[11px] font-bold text-ww-mid">
                          /
                          {cycleLabels[detail.cycle]}
                        </span>
                      </div>
                      {detail.nextBillingDate && (
                        <div className="relative mt-2 flex items-center gap-1.5 text-[11px] font-bold text-primary-deep">
                          <CalendarClock size={14} />
                          {formatNextBillingDate(detail.nextBillingDate)}
                        </div>
                      )}
                    </Surface>

                    <Card title={t('form.basicInfo')}>
                      <Row label={t('detail.type')} value={typeLabels[detail.type]} />
                      <Row label={t('detail.priority')} value={priorityLabels[detail.priority]} />
                      <Row label={t('detail.currency')} value={currencyLabels[detail.currency]} />
                      <Row label={t('detail.cycle')} value={cycleLabels[detail.cycle]} />
                      {detail.cycle === FixedExpenseCycle.CUSTOM && (
                        <Row label={t('detail.customCycleDays')} value={detail.customCycleDays ? t('detail.days', { count: detail.customCycleDays }) : undefined} />
                      )}
                    </Card>

                    <Card title={t('form.billAndDate')}>
                      <Row label={t('detail.billingDay')} value={detail.billingDay ? t('detail.monthlyDay', { day: detail.billingDay }) : undefined} />
                      <Row label={t('detail.nextBillingDate')} value={formatDate(detail.nextBillingDate)} />
                      <Row label={t('detail.startDate')} value={formatDate(detail.startDate)} />
                      <Row label={t('detail.endDate')} value={formatDate(detail.endDate)} />
                    </Card>

                    <Card title={t('form.paymentInfo')}>
                      <Row label={t('detail.provider')} value={detail.provider} />
                      <Row label={t('detail.account')} value={detail.account} />
                      <Row label={t('detail.paymentMethod')} value={detail.paymentMethod} />
                    </Card>

                    <Card title={t('form.statusAndPriority')}>
                      <Row label={t('detail.autoRenew')} value={detail.autoRenew ? t('detail.yes') : t('detail.no')} />
                      <Row label={t('detail.reminderEnabled')} value={detail.reminderEnabled ? t('detail.yes') : t('detail.no')} />
                      {detail.reminderEnabled && (
                        <Row label={t('detail.reminderDaysBefore')} value={t('detail.days', { count: detail.reminderDaysBefore })} />
                      )}
                      <Row label={t('detail.includeInStatistics')} value={detail.includeInStatistics ? t('detail.yes') : t('detail.no')} />
                      <Row label={t('detail.sort')} value={detail.sort} />
                    </Card>

                    {detail.comment && (
                      <Card title={t('detail.comment')}>
                        <div className="py-2 text-[13px] font-semibold leading-5 text-ww-ink">{detail.comment}</div>
                      </Card>
                    )}
                  </>
                )}
        </div>
      </main>
      <EditAndDeleteButton fixedExpenseId={detail?.id} />
    </div>
  );
};

export default FixedExpenseDetail;
