import React, { useEffect } from 'react';
import classNames from 'classnames';
import { NavBar } from '@/components';

enum BudgetItemType {
  ALL,
  CATEGORY,
}

export interface BudgetItemProps {
  className?: string;
  type?: BudgetItemType;
}

export const BudgetItem: React.FC<BudgetItemProps> = ({ type = BudgetItemType.ALL, className }) => {
  const isAll = type === BudgetItemType.ALL;

  return (
    <div className={classNames('flex-shrink-0 bg-[#fff] h-28 flex flex-col', className)}>
      <div className="flex items-center justify-between flex-shrink-0">
        <div>{ isAll ? '07月总预算' : '餐饮'}</div>
        <div>编辑</div>
      </div>
      <div className="flex flex-grow">
        <div>chart</div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <div>剩余预算:</div>
            <div>18486.00</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              {isAll && '本月'}
              预算:
            </div>
            <div>258438.00</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              {isAll && '本月'}
              支出:
            </div>
            <div>6896.00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BudgetProps {
}

const Budget: React.FC<BudgetProps> = () => {
  useEffect(() => {
  }, []);
  return (
    <div className="page-new bg-[#f6f6f6] fixed top-0 left-0 h-screen w-full pt-[45px]">
      <NavBar>月预算</NavBar>
      <div className="flex flex-grow flex-col overflow-auto ">
        <BudgetItem className="mb-3" />
        <div className="bg-[#fff] p-3">分类预算</div>
        {
            [1, 2, 3, 4, 5].map(item => (<BudgetItem key={item} type={BudgetItemType.CATEGORY} />))
          }
      </div>
    </div>
  );
};

export default Budget;
