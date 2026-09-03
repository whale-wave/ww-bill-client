import type { FC } from 'react';
import type { BudgetPresentationItem } from './BudgetItem';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon, MetricGrid, Surface } from '@/shared/ui';
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

  const content = (
    <Surface as="article" className="ww-current-budget-card overflow-hidden px-5 py-[18px]" material="raised">
      <div className="flex items-center gap-[10px]">
        <span className="ww-current-budget-icon flex h-[38px] w-[38px] items-center justify-center rounded-full">
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
    </Surface>
  );

  if (!onClick)
    return content;

  return (
    <button className="block w-full border-0 bg-transparent p-0 text-left" onClick={onClick} type="button">
      {content}
    </button>
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
