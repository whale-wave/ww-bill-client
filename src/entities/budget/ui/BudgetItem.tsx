import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { CategoryIcon } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
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
  index?: number;
  lastIndex?: number;
  editable?: boolean;
  onClick?: () => void;
}

const BudgetItem: React.FC<BudgetItemProps> = memo(({ budgetEntityType, type = BudgetEntityLevel.SUMMARY, className, data, editable = true, onClick }) => {
  const { t } = useTranslation('budget');
  const isSummaryBudget = type === BudgetEntityLevel.SUMMARY;

  return (
    <div
      className={classNames('relative flex flex-shrink-0 flex-col rounded-[20px] border border-solid border-border-primary p-4', className, {
        'ww-budget-summary-item shadow-ww': isSummaryBudget,
        'bg-white/85 shadow-ww-xs backdrop-blur-xl': !isSummaryBudget,
      })}
      data-budget-id={data.id}
      onClick={onClick}
    >
      <div className="flex flex-shrink-0 items-center justify-between">
        <div>
          { isSummaryBudget
            ? (
                <div className="text-[15px] font-extrabold text-ww-ink">
                  {data.title ?? (budgetEntityType === BudgetEntityType.MONTH
                    ? t('item.summary.month', { month: dayjs().format('MM') })
                    : t('item.summary.year', { year: dayjs().format('YYYY') }))}
                </div>
              )
            : (
                <div className="flex items-center gap-2.5">
                  <span className={classNames(
                    'flex h-11 w-11 items-center justify-center rounded-full',
                    'ww-budget-category-icon',
                  )}
                  >
                    <CategoryIcon
                      categoryName={data.category?.name}
                      iconKey={data.category?.icon}
                      size={24}
                    />
                  </span>
                  <div className="flex items-center text-[14px] font-bold text-ww-ink">{data.category?.name}</div>
                </div>
              )}
        </div>
        {editable && (
          <button className="rounded-full border-0 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-primary-deep" type="button">
            {t('item.edit')}
          </button>
        )}
      </div>
      <BudgetItemContent isSummaryBudget={isSummaryBudget} data={data} />
    </div>
  );
});

export default BudgetItem;
