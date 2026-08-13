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
        <span className="text-[13px] font-extrabold text-ww-ink">{t('list.upcoming')}</span>
        <span className="text-[10px] font-semibold text-ww-soft">
          {t('list.total')}
          {' '}
          {items.length}
          {' '}
          {t('list.items')}
        </span>
      </div>
      <div className="-mx-[18px] flex gap-3 overflow-x-auto px-[18px] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const tone = getNextBillingTone(item.nextBillingDate);
          const TypeIcon = typeIconMap[item.type];
          return (
            <button
              key={item.id}
              className="flex w-[158px] flex-shrink-0 flex-col justify-between rounded-[18px] border border-solid border-border-primary bg-white/80 p-3 text-left shadow-ww-xs active:scale-[0.99]"
              onClick={() => onClickItem?.(item)}
              type="button"
            >
              <div className="flex items-center space-x-1">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[11px] bg-primary-light/55 text-primary-deep">
                  <TypeIcon size={16} strokeWidth={1.8} />
                </span>
                <span className="truncate text-[12px] font-extrabold text-ww-ink">{item.name}</span>
              </div>
              <div className="mt-3 text-[14px] font-extrabold text-ww-ink">
                {formatAmountWithCurrency(item.amount, item.currency)}
              </div>
              <div
                className={cn(
                  'mt-2 self-start rounded-full px-2 py-1 text-[9px] font-bold',
                  toneBgClass[tone],
                )}
              >
                {formatNextBillingDate(item.nextBillingDate)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default UpcomingList;
