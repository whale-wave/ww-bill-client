import { Skeleton } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FixedExpenseCycle, useGetFixedExpenseByIdQuery } from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { NavBar } from '@/shared/ui';
import {
  currencyLabelMap,
  cycleLabelMap,
  priorityLabelMap,
  statusColorMap,
  statusLabelMap,
  typeIconMap,
  typeLabelMap,
} from './constants';
import { EditAndDeleteButton } from './ui';
import { formatAmountWithCurrency, formatDate, formatNextBillingDate } from './utils';

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5">
    <span className="text-sm text-font-gray">{label}</span>
    <span className="ml-3 max-w-[60%] text-right text-base text-font-black">
      {value || <span className="text-font-gray">--</span>}
    </span>
  </div>
);

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn('rounded-xl bg-white p-3 shadow-sm', className)}>
    {title && (
      <div className="mb-1 text-sm font-medium text-font-gray">{title}</div>
    )}
    <div className="divide-y divide-bg-gray">{children}</div>
  </div>
);

const FixedExpenseDetail: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { data: detail, isLoading } = useGetFixedExpenseByIdQuery({ params: { id } });

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const statusColor = useMemo(
    () => (detail ? statusColorMap[detail.status] : undefined),
    [detail],
  );

  return (
    <div className="page-new overflow-hidden">
      <NavBar back={t('common:nav.back')} onBack={onBack}>{t('detail.title')}</NavBar>
      <div className="flex-grow space-y-3 overflow-auto bg-bg-gray px-3 py-3">
        {isLoading || !detail
          ? (
              <div className="rounded-xl bg-white p-3">
                <Skeleton.Title animated />
                <Skeleton.Paragraph animated lineCount={6} />
              </div>
            )
          : (
              <>
                <div
                  className="relative overflow-hidden rounded-2xl p-4 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #5ab8e8 0%, #4fa9dc 52%, #3a87c4 100%)' }}
                >
                  <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/15" />
                  <div className="absolute -bottom-14 -left-6 h-28 w-28 rounded-full bg-white/10" />
                  <div className="relative flex items-center space-x-2 text-white">
                    <span className="text-xl">{typeIconMap[detail.type]}</span>
                    <span className="text-base font-medium">{detail.name}</span>
                    {statusColor && (
                      <span className="ml-auto inline-flex items-center space-x-1 rounded-full bg-white/25 px-2 py-0.5 text-xs backdrop-blur">
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusColor.dot)} />
                        <span>{statusLabelMap[detail.status]}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative mt-3 flex items-baseline space-x-1 text-white">
                    <span className="text-2xl font-bold leading-none drop-shadow-sm">
                      {formatAmountWithCurrency(detail.amount, detail.currency)}
                    </span>
                    <span className="text-sm text-white/80">
                      /
                      {cycleLabelMap[detail.cycle]}
                    </span>
                  </div>
                  {detail.nextBillingDate && (
                    <div className="relative mt-2 text-sm text-white/85">
                      {formatNextBillingDate(detail.nextBillingDate)}
                    </div>
                  )}
                </div>

                <Card title={t('form.basicInfo')}>
                  <Row label={t('detail.type')} value={typeLabelMap[detail.type]} />
                  <Row label={t('detail.priority')} value={priorityLabelMap[detail.priority]} />
                  <Row label={t('detail.currency')} value={currencyLabelMap[detail.currency]} />
                  <Row label={t('detail.cycle')} value={cycleLabelMap[detail.cycle]} />
                  {detail.cycle === FixedExpenseCycle.CUSTOM && (
                    <Row label={t('detail.customCycleDays')} value={detail.customCycleDays ? t('detail.days', { days: detail.customCycleDays }) : undefined} />
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
                    <Row label={t('detail.reminderDaysBefore')} value={t('detail.days', { days: detail.reminderDaysBefore })} />
                  )}
                  <Row label={t('detail.includeInStatistics')} value={detail.includeInStatistics ? t('detail.yes') : t('detail.no')} />
                  <Row label={t('detail.sort')} value={detail.sort} />
                </Card>

                {detail.comment && (
                  <Card title={t('detail.comment')}>
                    <div className="py-2 text-base text-font-black">{detail.comment}</div>
                  </Card>
                )}
              </>
            )}
      </div>
      <EditAndDeleteButton fixedExpenseId={detail?.id} />
    </div>
  );
};

export default FixedExpenseDetail;
