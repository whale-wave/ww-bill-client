import { Card } from 'antd-mobile';
import { AddOutline, RightOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { BudgetEntityType } from '../api';
import { useGetBudgetInfoQuery } from '../hooks';
import BudgetItemContent from './BudgetItemContent';

interface CardProps {
}

const CurMonthBudgetCard: React.FC<CardProps> = () => {
  const { t } = useTranslation('budget');
  const navigate = useNavigate();

  const { data, isLoading } = useGetBudgetInfoQuery({
    params: {
      type: BudgetEntityType.MONTH,
    },
  });

  const title = t('card.currentMonthSummary', { month: dayjs().format('MM') });

  const onClick = useCallback(() => {
    navigate('/budget');
  }, []);

  const SettingBudgetButton = (
    <div className="flex items-center bg-primary space-x-1 py-[6px] px-2 text-sm rounded-[4px]">
      <div><AddOutline /></div>
      <div>{t('card.setBudget')}</div>
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
