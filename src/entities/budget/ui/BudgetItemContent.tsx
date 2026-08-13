import type { BudgetPresentationItem } from './BudgetItem';
import React, { memo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { RingChart } from './RingChart';

interface BudgetItemContentProps {
  isSummaryBudget: boolean;
  data?: BudgetPresentationItem;
}

const BudgetItemContent: React.FC<BudgetItemContentProps> = memo((props) => {
  const { t } = useTranslation('budget');
  const { data, isSummaryBudget } = props;

  return (
    <div className={`flex flex-grow items-center ${isSummaryBudget ? 'min-h-[126px] pt-2' : 'min-h-[104px] pt-1'}`}>
      <div className="mr-2 flex items-center justify-center"><RingChart isSummaryBudget={isSummaryBudget} percentage={data?.remainingPercentage} /></div>
      <div className="min-w-0 flex-grow">
        <div className="text-[11px] font-semibold text-ww-mid">{t('content.remainingBudget')}</div>
        <div className={`${isSummaryBudget ? 'text-[25px]' : 'text-[20px]'} mt-0.5 truncate font-black leading-8 text-ww-ink`}>
          ¥
          {data?.remaining || '0.00'}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/60 px-2.5 py-2">
            <div className="text-[10px] text-ww-mid">{t('content.budget')}</div>
            <div className="mt-0.5 truncate text-[12px] font-bold text-ww-ink">
              ¥
              {data?.budgetAmount || '0.00'}
            </div>
          </div>
          <div className="rounded-xl bg-white/60 px-2.5 py-2">
            <div className="text-[10px] text-ww-mid">{t('content.expense')}</div>
            <div className="mt-0.5 truncate text-[12px] font-bold text-ww-ink">
              ¥
              {data?.amount || '0.00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BudgetItemContent;
