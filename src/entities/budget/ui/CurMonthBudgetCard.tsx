import type { FC } from 'react';
import type { BudgetInfo } from '../api';
import type { BudgetPresentationItem } from './BudgetItem';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
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
  const budgetAmount = Number(data?.budgetAmount ?? 0);
  const amount = Number(data?.amount ?? 0);
  const hasBudget = Number.isFinite(budgetAmount) && budgetAmount > 0;
  const isOverBudget = hasBudget && amount > budgetAmount;
  const usedPercentage = hasBudget ? Math.max(0, Math.min(100, (amount / budgetAmount) * 100)) : 0;

  const content = (
    <Surface as="article" className="ww-current-budget-card overflow-hidden px-5 py-[18px]" material="raised">
      <div className="flex items-center gap-[10px]">
        <span className="ww-current-budget-icon flex h-[38px] w-[38px] items-center justify-center rounded-full">
          <DesignIcon name="discovery-budget" size={18} />
        </span>
        <div className="truncate text-[14px] font-bold leading-[21px] text-ww-ink">{title}</div>
      </div>
      <div className="mt-[14px] flex items-center justify-between text-[11px] leading-[16.5px] text-ww-soft">
        <span className={isOverBudget ? 'font-bold text-finance-expense' : undefined}>{isOverBudget ? t('ringChart.overBudget') : t('used')}</span>
        <span className="font-number">
          {data?.amount ?? '0.00'}
          {' '}
          /
          {' '}
          {data?.budgetAmount ?? '0.00'}
        </span>
      </div>
      <div
        aria-label={isOverBudget ? t('ringChart.overBudget') : t('used')}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={isLoading ? 0 : usedPercentage}
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary-light/70"
        data-budget-progress
        role="progressbar"
      >
        <div
          className={`h-full rounded-full ${isOverBudget ? 'bg-finance-expense' : 'bg-ww-pink'}`}
          style={{ width: `${isLoading ? 0 : usedPercentage}%` }}
        />
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

const DiscoveryBudgetLoadingCard: FC = () => (
  <Surface
    aria-label="正在加载预算"
    as="article"
    className="overflow-hidden px-5 py-[18px]"
    material="raised"
  >
    <div className="flex items-center gap-[10px]">
      <span className="h-[38px] w-[38px] animate-pulse rounded-full bg-primary-light/60" />
      <span className="h-4 w-28 animate-pulse rounded-full bg-ww-surface-muted" />
    </div>
    <div className="mt-[18px] h-3 w-full animate-pulse rounded-full bg-ww-surface-muted" />
    <div className="mt-[18px] grid grid-cols-3 gap-3">
      {[0, 1, 2].map(key => <span className="h-8 animate-pulse rounded-lg bg-ww-surface-muted" key={key} />)}
    </div>
  </Surface>
);

interface EmptyDiscoveryBudgetCardProps {
  onClick: () => void;
}

const EmptyDiscoveryBudgetCard: FC<EmptyDiscoveryBudgetCardProps> = ({ onClick }) => {
  const { t } = useTranslation('budget');

  return (
    <Surface as="article" className="relative overflow-hidden px-5 py-4" material="raised">
      <button
        aria-label={t('addBudget')}
        className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent"
        data-discovery-add-budget
        onClick={onClick}
        type="button"
      />
      <div className="flex min-w-0 items-center gap-3">
        <span className="ww-current-budget-icon flex h-[38px] w-[38px] items-center justify-center rounded-full">
          <DesignIcon name="discovery-budget" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold leading-[21px] text-ww-ink">{t('emptyDiscovery.title')}</div>
          <p className="mt-0.5 text-[12px] font-medium leading-[18px] text-ww-mid">{t('emptyDiscovery.description')}</p>
        </div>
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
          <Plus size={19} strokeWidth={2.4} />
        </span>
      </div>
    </Surface>
  );
};

const CurMonthBudgetCard: FC = () => {
  const { t } = useTranslation('budget');
  const navigate = useNavigate();
  const dayBudget = useGetBudgetInfoQuery({ params: { type: BudgetEntityType.DAY } });
  const monthBudget = useGetBudgetInfoQuery({ params: { type: BudgetEntityType.MONTH } });
  const yearBudget = useGetBudgetInfoQuery({ params: { type: BudgetEntityType.YEAR } });
  const budgetCards = useMemo(() => [
    {
      data: dayBudget.data.summaryBudget,
      title: t('card.currentPeriodSummary.day', { day: dayjs().format('DD'), month: dayjs().format('MM') }),
      type: BudgetEntityType.DAY,
    },
    {
      data: monthBudget.data.summaryBudget,
      title: t('card.currentPeriodSummary.month', { month: dayjs().format('MM') }),
      type: BudgetEntityType.MONTH,
    },
    {
      data: yearBudget.data.summaryBudget,
      title: t('card.currentPeriodSummary.year', { year: dayjs().format('YYYY') }),
      type: BudgetEntityType.YEAR,
    },
  ].filter((card): card is { data: BudgetInfo; title: string; type: BudgetEntityType } => Boolean(card.data)), [
    dayBudget.data.summaryBudget,
    monthBudget.data.summaryBudget,
    t,
    yearBudget.data.summaryBudget,
  ]);
  const isLoading = dayBudget.isLoading || monthBudget.isLoading || yearBudget.isLoading;
  const onBudgetClick = useCallback((type: BudgetEntityType) => navigate(`/budget?type=${type}`), [navigate]);
  const onAddBudget = useCallback(() => navigate('/budget'), [navigate]);

  if (isLoading)
    return <DiscoveryBudgetLoadingCard />;

  if (budgetCards.length === 0)
    return <EmptyDiscoveryBudgetCard onClick={onAddBudget} />;

  return (
    <div className="space-y-[14px]" data-discovery-budget-card-list>
      {budgetCards.map(({ data, title, type }) => (
        <CurrentBudgetSummaryCardPresentation
          data={data}
          key={type}
          onClick={() => onBudgetClick(type)}
          title={title}
        />
      ))}
    </div>
  );
};

export default CurMonthBudgetCard;
