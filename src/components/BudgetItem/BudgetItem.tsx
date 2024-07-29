import React, { memo } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { BudgetEntityLevel, BudgetEntityType } from '@/api';
import type { BudgetInfo } from '@/api';
import { BudgetItemContent, Icon } from '@/components';

export interface BudgetItemProps {
  className?: string;
  budgetEntityType: BudgetEntityType;
  type?: BudgetEntityLevel;
  data: BudgetInfo;
  style?: React.CSSProperties;
  index?: number;
  lastIndex?: number;
  onClick: () => void;
}

const BudgetItem: React.FC<BudgetItemProps> = memo(({ budgetEntityType, type = BudgetEntityLevel.SUMMARY, className, data, style, index, lastIndex, onClick }) => {
  const isSummaryBudget = type === BudgetEntityLevel.SUMMARY;

  return (
    <div
      className={classNames('flex-shrink-0 bg-[#fff] flex flex-col pt-3 pr-3 relative', className, {
        'pl-3': isSummaryBudget,
        'pl-5': !isSummaryBudget,
      })}
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
              <div className="text-[15px]">
                {budgetEntityType === BudgetEntityType.MONTH ? `${dayjs().format('MM')}月` : `${dayjs().format('YYYY')}年`}
                总预算
              </div>
              )
            : (
              <div className="flex items-center justify-center space-x-2">
                <div className="rounded-full text-[15px] bg-[#f2f2f2] w-[22px] h-[22px] flex justify-center items-center">
                  <Icon name={data.category!.icon} />
                </div>
                <div className="flex items-center" style={{ transform: 'translateY(0px)' }}>{data.category!.name}</div>
              </div>
              )}
        </div>
        <div className="text-[13px] text-[#6C6C6C]">编辑</div>
      </div>
      <BudgetItemContent isSummaryBudget={isSummaryBudget} data={data} />
    </div>
  );
});

export default BudgetItem;
