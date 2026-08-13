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

const BudgetItem: React.FC<BudgetItemProps> = memo(({ budgetEntityType, type = BudgetEntityLevel.SUMMARY, className, data, index = 0, editable = true, onClick }) => {
  const { t } = useTranslation('budget');
  const isSummaryBudget = type === BudgetEntityLevel.SUMMARY;

  return (
    <div
      className={classNames('relative flex flex-shrink-0 flex-col rounded-[20px] border border-solid border-border-primary p-4', className, {
        'bg-[linear-gradient(155deg,rgba(212,240,250,0.96),rgba(255,255,255,0.92)_52%,rgba(241,232,255,0.82))] shadow-ww': isSummaryBudget,
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
                    index % 4 === 1
                      ? 'bg-[#fff0f5] text-[#cf7894]'
                      : index % 4 === 2
                        ? 'bg-[#f1ecff] text-[#8d78c7]'
                        : index % 4 === 3
                          ? 'bg-[#e7f7f0] text-[#4d9d82]'
                          : 'bg-[#e4f5fa] text-primary-deep',
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
