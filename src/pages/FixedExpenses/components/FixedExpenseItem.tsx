import type { FixedExpenseEntity } from '@/entities/fixed-expense';
import React, { memo, useCallback } from 'react';
import { cn } from '@/shared/lib';
import {
  cycleLabelMap,
  priorityBarColorMap,
  statusColorMap,
  statusLabelMap,
  typeIconMap,
  typeLabelMap,
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
  const { className, item, onClick: _onClick } = props;

  const onClick = useCallback(() => {
    _onClick?.(item);
  }, [item, _onClick]);

  const statusColor = statusColorMap[item.status];
  const tone = getNextBillingTone(item.nextBillingDate);
  const nextBillingText = formatNextBillingDate(item.nextBillingDate);

  return (
    <div
      className={cn(
        className,
        'flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)] active:opacity-80',
      )}
      onClick={onClick}
    >
      <div className={cn('w-[3px] flex-shrink-0', priorityBarColorMap[item.priority])} />
      <div className="flex flex-grow flex-col px-3 py-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-grow items-center space-x-2 overflow-hidden pr-2">
            <span className="text-[18px]">{typeIconMap[item.type]}</span>
            <span className="truncate text-[15px] font-medium text-slate-800">
              {item.name}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-baseline space-x-0.5 text-slate-900">
            <span className="text-[16px] font-semibold">
              {formatAmountWithCurrency(item.amount, item.currency)}
            </span>
            <span className="text-[11px] text-font-gray">
              /
              {cycleLabelMap[item.cycle]}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={cn(
                'inline-flex items-center space-x-1 rounded px-1.5 py-0.5 text-[11px]',
                statusColor.bg,
                statusColor.text,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusColor.dot)} />
              <span>{statusLabelMap[item.status]}</span>
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
              {typeLabelMap[item.type]}
            </span>
            {item.autoRenew && (
              <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[11px] text-cyan-700">
                自动续费
              </span>
            )}
          </div>
          {nextBillingText && (
            <span className={cn('text-[11px]', toneTextClass[tone])}>
              {nextBillingText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default FixedExpenseItem;
