import React, { memo, useEffect } from 'react';
import classNames from 'classnames';
import { Tiny } from '@ant-design/charts';
import { NavBar } from '@/components';

const THEME_COLOR = '#aeeeff';

enum BudgetItemType {
  ALL,
  CATEGORY,
}

export interface BudgetItemProps {
  className?: string;
  type?: BudgetItemType;
}

export const BudgetItem: React.FC<BudgetItemProps> = memo(({ type = BudgetItemType.ALL, className }) => {
  const isAll = type === BudgetItemType.ALL;

  const config = {
    height: 100,
    width: 100,
    padding: isAll ? 10 : 15,
    percent: 0.7,
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
          fontSize: isAll ? 12 : 11,
          color: 'red',
        },
      },
      {
        type: 'text',
        style: {
          text: `100%`,
          x: '50%',
          y: '62%',
          textAlign: 'center',
          fontSize: isAll ? 14 : 13,
        },
      },
    ],
  };

  return (
    <div className={classNames('flex-shrink-0 bg-[#fff] flex flex-col', className)}>
      <div className="flex items-center justify-between flex-shrink-0">
        <div>{ isAll ? '07月总预算' : '餐饮'}</div>
        <div>编辑</div>
      </div>
      <div className="flex flex-grow h-[110px]">
        <div className="flex justify-center items-center mr-3"><Tiny.Ring {...config} /></div>
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
});

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
