import type { FixedExpenseEntity } from '@/entities/fixed-expense';
import React, { memo, useCallback } from 'react';
import {
  FixedExpenseCycle,
  FixedExpenseStatus,
  FixedExpenseType,
} from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  priorityBarColorMap,
  statusColorMap,
  typeIconMap,
} from '../constants';
import {
  formatAmountWithCurrency,
  formatNextBillingDate,
  getNextBillingTone,
} from '../utils';

interface FixedExpenseItemProps {
  className?: string;
  item: FixedExpenseEntity;
  onClick?: (item: FixedExpenseEntity) => void;
}

const toneTextClass: Record<ReturnType<typeof getNextBillingTone>, string> = {
  overdue: 'text-rose-600',
  urgent: 'text-rose-600',
  soon: 'text-amber-700',
  normal: 'text-font-gray',
};

const FixedExpenseItem: React.FC<FixedExpenseItemProps> = memo((props) => {
  const { t } = useTranslation('fixed-expense');
  const { className, item, onClick: _onClick } = props;

  const onClick = useCallback(() => {
    _onClick?.(item);
  }, [item, _onClick]);

  const statusColor = statusColorMap[item.status];
  const tone = getNextBillingTone(item.nextBillingDate);
  const nextBillingText = formatNextBillingDate(item.nextBillingDate);
  const TypeIcon = typeIconMap[item.type];

  const cycleKeyMap: Record<FixedExpenseCycle, string> = {
    [FixedExpenseCycle.WEEKLY]: 'cycle.weeklyShort',
    [FixedExpenseCycle.MONTHLY]: 'cycle.monthlyShort',
    [FixedExpenseCycle.QUARTERLY]: 'cycle.quarterlyShort',
    [FixedExpenseCycle.HALF_YEARLY]: 'cycle.halfYearly',
    [FixedExpenseCycle.YEARLY]: 'cycle.yearlyShort',
    [FixedExpenseCycle.CUSTOM]: 'cycle.custom',
  };

  const statusKeyMap: Record<FixedExpenseStatus, string> = {
    [FixedExpenseStatus.ACTIVE]: 'status.active',
    [FixedExpenseStatus.PAUSED]: 'status.paused',
    [FixedExpenseStatus.CANCELLED]: 'status.cancelled',
    [FixedExpenseStatus.EXPIRED]: 'status.expired',
  };

  const typeKeyMap: Record<FixedExpenseType, string> = {
    [FixedExpenseType.SUBSCRIPTION]: 'type.subscription',
    [FixedExpenseType.UTILITY]: 'type.utility',
    [FixedExpenseType.HOUSING]: 'type.housing',
    [FixedExpenseType.TRANSPORT]: 'type.transport',
    [FixedExpenseType.FAMILY]: 'type.family',
    [FixedExpenseType.WORK]: 'type.work',
    [FixedExpenseType.OTHER]: 'type.other',
  };

  return (
    <button
      className={cn(
        className,
        'flex w-full overflow-hidden rounded-[20px] border border-solid border-border-primary bg-white/80 p-0 text-left shadow-ww-xs backdrop-blur-xl transition active:scale-[0.99]',
      )}
      onClick={onClick}
      type="button"
    >
      <div className={cn('w-[3px] flex-shrink-0', priorityBarColorMap[item.priority])} />
      <div className="flex min-w-0 flex-grow flex-col px-4 py-3.5">
        <div className="flex items-start justify-between">
          <div className="flex flex-grow items-center space-x-2 overflow-hidden pr-2">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[13px] bg-primary-light/55 text-primary-deep">
              <TypeIcon size={18} strokeWidth={1.8} />
            </span>
            <span className="truncate text-[14px] font-extrabold text-ww-ink">
              {item.name}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-baseline space-x-0.5 text-ww-ink">
            <span className="text-[14px] font-extrabold">
              {formatAmountWithCurrency(item.amount, item.currency)}
            </span>
            <span className="text-[10px] font-semibold text-ww-soft">
              /
              {t(cycleKeyMap[item.cycle])}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={cn(
                'inline-flex items-center space-x-1 rounded-full px-2 py-1 text-[9px] font-bold',
                statusColor.bg,
                statusColor.text,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusColor.dot)} />
              <span>{t(statusKeyMap[item.status])}</span>
            </span>
            <span className="rounded-full bg-primary-light/35 px-2 py-1 text-[9px] font-bold text-primary-deep">
              {t(typeKeyMap[item.type])}
            </span>
            {item.autoRenew && (
              <span className="rounded-full bg-[#fff1f6] px-2 py-1 text-[9px] font-bold text-[#ad496b]">
                {t('form.autoRenew')}
              </span>
            )}
          </div>
          {nextBillingText && (
            <span className={cn('text-[10px] font-bold', toneTextClass[tone])}>
              {nextBillingText}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default FixedExpenseItem;
