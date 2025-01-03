import React, { useCallback } from 'react';
import { Card } from 'antd-mobile';
import { AddOutline, RightOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { BudgetItemContent } from '@/components';
import { useGetBudgetInfoQuery } from '@/hooks';
import { BudgetEntityType } from '@/api';

interface CardProps {
}

const CurMonthBudgetCard: React.FC<CardProps> = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useGetBudgetInfoQuery({
    params: {
      type: BudgetEntityType.MONTH,
    },
  });

  const title = `${dayjs().format('MM')}月总预算`;

  const onClick = useCallback(() => {
    navigate('/budget');
  }, []);

  const SettingBudgetButton = (
    <div className="flex items-center bg-primary space-x-1 py-[6px] px-2 text-[13px] rounded-[4px]">
      <div><AddOutline /></div>
      <div>设置预算</div>
    </div>
  );

  return (
    <Card
      title={title}
      extra={!isLoading && data?.summaryBudget
        ? <RightOutline />
        : SettingBudgetButton}
      onClick={onClick}
      bodyClassName="!pt-0 !px-3"
    >
      <BudgetItemContent isSummaryBudget data={data?.summaryBudget} />
    </Card>
  );
};

export default CurMonthBudgetCard;
