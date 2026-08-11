import type { FC } from 'react';
import type { BudgetPresentationItem } from './BudgetItem';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, GradientPanel, MetricGrid } from '@/shared/ui';
import { BudgetEntityType } from '../api';
import { useGetBudgetInfoQuery } from '../hooks';

interface CurrentBudgetSummaryCardPresentationProps {
  data?: BudgetPresentationItem;
  isLoading?: boolean;
  onClick?: () => void;
  title: string;
}

export const CurrentBudgetSummaryCardPresentation: FC<CurrentBudgetSummaryCardPresentationProps> = ({
  data,
  isLoading,
  onClick,
  title,
}) => {
  const { t } = useTranslation('budget');
  const percentage = Math.max(0, Math.min(100, Number(data?.remainingPercentage ?? 0)));

  return (
    <GradientPanel as="article" className="cursor-pointer overflow-hidden px-5 py-[18px] shadow-[0_6px_11px_rgba(200,80,140,0.12)]" elevation="none" onClick={onClick} surface="blush">
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/70 text-[#d06080]">
          <DesignIcon name="discovery-budget" size={18} />
        </span>
        <div className="truncate text-[14px] font-bold leading-[21px] text-ww-ink">{title}</div>
      </div>
      <div className="mt-[14px] flex items-center justify-between text-[11px] leading-[16.5px] text-ww-soft">
        <span>{t('used')}</span>
        <span className="font-number">
          {data?.amount ?? '0.00'}
          {' '}
          /
          {' '}
          {data?.budgetAmount ?? '0.00'}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/55">
        <div className="h-full rounded-full bg-ww-pink" style={{ width: `${isLoading ? 0 : percentage}%` }} />
      </div>
      <MetricGrid
        className="mt-[14px]"
        density="compact"
        items={[
          { key: 'remaining', label: t('content.remainingBudget'), value: `¥${data?.remaining ?? '0.00'}` },
          { key: 'budget', label: t('content.budget'), tone: 'primary', value: `¥${data?.budgetAmount ?? '0.00'}` },
          { key: 'expense', label: t('content.expense'), tone: 'expense', value: `¥${data?.amount ?? '0.00'}` },
        ]}
      />
    </GradientPanel>
  );
};

const CurMonthBudgetCard: FC = () => {
  const { t } = useTranslation('budget');
  const navigate = useNavigate();
  const { data, isLoading } = useGetBudgetInfoQuery({ params: { type: BudgetEntityType.MONTH } });
  const onClick = useCallback(() => navigate('/budget'), [navigate]);

  return (
    <CurrentBudgetSummaryCardPresentation
      data={data?.summaryBudget}
      isLoading={isLoading}
      onClick={onClick}
      title={t('card.currentMonthSummary', { month: dayjs().format('MM') })}
    />
  );
};

export default CurMonthBudgetCard;
