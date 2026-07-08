import type { BudgetInfo } from '../api';
import React, { memo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { RingChart } from './RingChart';

interface BudgetItemContentProps {
  isSummaryBudget: boolean;
  data?: BudgetInfo;
}

const BudgetItemContent: React.FC<BudgetItemContentProps> = memo((props) => {
  const { t } = useTranslation('budget');
  const { data, isSummaryBudget } = props;

  return (
    <div className="flex flex-grow h-[110px]">
      <div className="flex justify-center items-center mr-2"><RingChart isSummaryBudget={isSummaryBudget} percentage={data?.remainingPercentage} /></div>
      <div className="flex-grow flex flex-col justify-center space-y-3">
        <div className="flex justify-between items-center text-base border-0 border-b-[1px] border-solid border-[#f3f3f3] pb-1">
          <div>{t('content.remainingBudget')}</div>
          <div className="text-base">{data?.remaining || '0.00'}</div>
        </div>
        <div className="flex justify-between items-center text-sm text-[#666]">
          <div>
            {isSummaryBudget && t('content.thisMonth')}
            {t('content.budget')}
          </div>
          <div>{data?.budgetAmount || '0.00'}</div>
        </div>
        <div className="flex justify-between items-center text-sm text-[#666]">
          <div>
            {isSummaryBudget && t('content.thisMonth')}
            {t('content.expense')}
          </div>
          <div>{data?.amount || '0.00'}</div>
        </div>
      </div>
    </div>
  );
});

export default BudgetItemContent;
