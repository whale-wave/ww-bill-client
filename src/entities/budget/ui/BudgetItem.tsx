import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { CategoryIcon } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Surface } from '@/shared/ui';
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
    <Surface
      as="article"
      className={cn('relative flex flex-shrink-0 flex-col p-4', className)}
      data-budget-id={data.id}
      material={isSummaryBudget ? 'raised' : 'content'}
    >
      <button
        className={classNames('block min-w-0 border-0 bg-transparent p-0 text-left', editable && 'pr-16')}
        data-budget-item-action
        onClick={onClick}
        type="button"
      >
        <div className="flex min-w-0 flex-shrink-0 items-center justify-between">
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
        </div>
        <BudgetItemContent isSummaryBudget={isSummaryBudget} data={data} />
      </button>
      {editable && (
        <button
          className="absolute right-4 top-4 rounded-full border-0 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-primary-deep"
          onClick={onClick}
          type="button"
        >
          {t('item.edit')}
        </button>
      )}
    </Surface>
  );
});

export default BudgetItem;
