import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { Icon } from '@/shared/ui';
import { BudgetEntityLevel, BudgetEntityType } from '../api';
import BudgetItemContent from './BudgetItemContent';

export interface BudgetPresentationItem {
  id: string;
  title?: string;
  category?: {
    icon?: string;
    name: string;
  };
  budgetAmount: number | string;
  amount: number | string;
  remaining: number | string;
  remainingPercentage?: number | string | null;
}

export interface BudgetItemProps {
  className?: string;
  budgetEntityType: BudgetEntityType;
  type?: BudgetEntityLevel;
  data: BudgetPresentationItem;
  style?: React.CSSProperties;
  index?: number;
  lastIndex?: number;
  onClick: () => void;
}

const BudgetItem: React.FC<BudgetItemProps> = memo(({ budgetEntityType, type = BudgetEntityLevel.SUMMARY, className, data, style, index, lastIndex, onClick }) => {
  const { t } = useTranslation('budget');
  const isSummaryBudget = type === BudgetEntityLevel.SUMMARY;

  return (
    <div
      className={classNames('flex-shrink-0 bg-[#fff] flex flex-col pt-3 pr-3 relative', className, {
        'pl-3': isSummaryBudget,
        'pl-5': !isSummaryBudget,
      })}
      data-budget-id={data.id}
      style={style}
      onClick={onClick}
    >
      {
        typeof index === 'number' && typeof lastIndex === 'number' && index !== lastIndex && <div className="absolute w-[95%] h-[1px] bg-[#f3f3f3] right-0 bottom-0"></div>
      }
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          { isSummaryBudget
            ? (
                <div className="text-base">
                  {data.title ?? (budgetEntityType === BudgetEntityType.MONTH
                    ? t('item.summary.month', { month: dayjs().format('MM') })
                    : t('item.summary.year', { year: dayjs().format('YYYY') }))}
                </div>
              )
            : (
                <div className="flex items-center justify-center space-x-2">
                  <div className="rounded-full text-base bg-[#f2f2f2] w-[22px] h-[22px] flex justify-center items-center">
                    <Icon name={data.category?.icon ?? 'bill'} />
                  </div>
                  <div className="flex items-center">{data.category?.name}</div>
                </div>
              )}
        </div>
        <div className="text-sm text-[#6C6C6C]">{t('item.edit')}</div>
      </div>
      <BudgetItemContent isSummaryBudget={isSummaryBudget} data={data} />
    </div>
  );
});

export default BudgetItem;
