import React, { memo } from 'react';
import { RingChart } from './RingChart';
import type { BudgetInfo } from '@/api';

interface BudgetItemContentProps {
  isSummaryBudget: boolean;
  data?: BudgetInfo;
}

const BudgetItemContent: React.FC<BudgetItemContentProps> = memo((props) => {
  const { data, isSummaryBudget } = props;

  return (
    <div className="flex flex-grow h-[110px]">
      <div className="flex justify-center items-center mr-2"><RingChart isSummaryBudget={isSummaryBudget} percentage={data?.remainingPercentage} /></div>
      <div className="flex-grow flex flex-col justify-center space-y-3">
        <div className="flex justify-between items-center text-[15px] border-0 border-b-[1px] border-solid border-[#f3f3f3] pb-1">
          <div>剩余预算:</div>
          <div className="text-[15px]">{data?.remaining || '0.00'}</div>
        </div>
        <div className="flex justify-between items-center text-[12px] text-[#666]">
          <div>
            {isSummaryBudget && '本月'}
            预算:
          </div>
          <div>{data?.budgetAmount || '0.00'}</div>
        </div>
        <div className="flex justify-between items-center text-[12px] text-[#666]">
          <div>
            {isSummaryBudget && '本月'}
            支出:
          </div>
          <div>{data?.amount || '0.00'}</div>
        </div>
      </div>
    </div>
  );
});

export default BudgetItemContent;
