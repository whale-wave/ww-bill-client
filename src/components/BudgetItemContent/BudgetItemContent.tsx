import React, { memo } from 'react';
import { Tiny } from '@ant-design/charts';
import type { BudgetInfo } from '@/api';

const THEME_COLOR = '#aeeeff';

interface BudgetItemContentProps {
  isSummaryBudget: boolean;
  data?: BudgetInfo;
  allowEmpty?: boolean;
}

const BudgetItemContent: React.FC<BudgetItemContentProps> = memo((props) => {
  const { data, isSummaryBudget } = props;

  const config = {
    height: 100,
    width: 100,
    paddingTop: isSummaryBudget ? 10 : 15,
    paddingBottom: isSummaryBudget ? 10 : 15,
    paddingRight: isSummaryBudget ? 10 : 15,
    paddingLeft: -10,
    percent: data ? Number(data.remainingPercentage) < 0 ? 0.0001 : Number(data.remainingPercentage) / 100 : 0.0001,
    autoFit: true,
    color: ['#f2f2f2', THEME_COLOR],
    annotations: [
      {
        type: 'text',
        style: {
          text: `剩余`,
          x: '50%',
          y: '38%',
          textAlign: 'center',
          fontSize: isSummaryBudget ? 12 : 11,
          fill: '#666',
        },
      },
      {
        type: 'text',
        style: {
          text: `${data ? data.remainingPercentage : 0}%`,
          x: '50%',
          y: '62%',
          textAlign: 'center',
          fontSize: isSummaryBudget ? 14 : 13,
        },
      },
    ],
  };

  if (Number(data?.remainingPercentage) < 0) {
    config.annotations = [
      {
        type: 'text',
        style: {
          text: `已超支`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: isSummaryBudget ? 16 : 14,
          fill: '#e84149',
        },
      },
    ];
  }
  return (
    <div className="flex flex-grow h-[110px]">
      <div className="flex justify-center items-center mr-2"><Tiny.Ring {...config} /></div>
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
