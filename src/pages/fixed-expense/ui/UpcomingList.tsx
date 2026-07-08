import type { FixedExpenseEntity } from '@/entities/fixed-expense';
import React, { memo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { typeIconMap } from '../constants';
import {
  formatAmountWithCurrency,
  formatNextBillingDate,
  getNextBillingTone,
} from '../utils';

interface UpcomingListProps {
  className?: string;
  items: FixedExpenseEntity[];
  onClickItem?: (item: FixedExpenseEntity) => void;
}

const toneBgClass = {
  overdue: 'bg-rose-50 text-rose-600',
  urgent: 'bg-rose-50 text-rose-600',
  soon: 'bg-amber-50 text-amber-700',
  normal: 'bg-cyan-50 text-cyan-700',
} as const;

const UpcomingList: React.FC<UpcomingListProps> = memo((props) => {
  const { t } = useTranslation('fixed-expense');
  const { className, items, onClickItem } = props;

  if (!items.length)
    return null;

  return (
    <div className={cn(className)}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium text-slate-800">{t('list.upcoming')}</span>
        <span className="text-xs text-font-gray">
          {t('list.total')}
          {' '}
          {items.length}
          {' '}
          {t('list.items')}
        </span>
      </div>
      <div className="-mx-3 flex space-x-2 overflow-x-auto px-3 pb-1">
        {items.map((item) => {
          const tone = getNextBillingTone(item.nextBillingDate);
          return (
            <div
              key={item.id}
              className="flex w-[150px] flex-shrink-0 flex-col justify-between rounded-xl bg-white p-3 shadow-sm active:opacity-80"
              onClick={() => onClickItem?.(item)}
            >
              <div className="flex items-center space-x-1">
                <span className="text-base">{typeIconMap[item.type]}</span>
                <span className="truncate text-sm text-slate-800">{item.name}</span>
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {formatAmountWithCurrency(item.amount, item.currency)}
              </div>
              <div
                className={cn(
                  'mt-2 self-start rounded px-1.5 py-0.5 text-xs',
                  toneBgClass[tone],
                )}
              >
                {formatNextBillingDate(item.nextBillingDate)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default UpcomingList;
