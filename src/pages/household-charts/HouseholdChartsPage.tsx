import type { FC } from 'react';
import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import type { Household, HouseholdChartResult } from '@/entities/household';
import type {
  ChartOverviewContextValue,
  ChartOverviewRankingItem,
  ChartOverviewTab,
} from '@/features/chart-overview';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHouseholdChartsQuery } from '@/entities/household';
import { ChartOverviewBody, ChartOverviewContext } from '@/features/chart-overview';
import {
  formatCalendarDate,
  HouseholdBottomNav,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';

function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}

function isTimeRangeCategory(value: string | null): value is TimeRangeCategory {
  return value === 'week' || value === 'month' || value === 'year';
}

function toPercentage(value: number) {
  const percentage = value <= 1 ? value * 100 : value;
  return Number.isInteger(percentage) ? String(percentage) : percentage.toFixed(2);
}

function getPeriodName(data: HouseholdChartResult) {
  if (data.period === 'year')
    return data.startDate.slice(0, 4);
  if (data.period === 'month')
    return data.startDate.slice(0, 7);
  return `${data.startDate.slice(5)}–${data.endDate.slice(5)}`;
}

function mapCategoryRanking(
  data: HouseholdChartResult,
  amountType: AmountType,
): ChartOverviewRankingItem[] {
  return data.categories.map(item => ({
    amount: item.amount,
    category: {
      icon: item.icon || 'bill',
      id: item.key,
      name: item.name,
    },
    percentage: toPercentage(item.percent),
    type: amountType,
  }));
}

function mapMemberRanking(
  data: HouseholdChartResult,
  amountType: AmountType,
): ChartOverviewRankingItem[] {
  return data.members.map(item => ({
    amount: item.amount,
    category: {
      icon: 'mine',
      id: item.user.id,
      name: item.user.name || item.user.username || '—',
    },
    percentage: toPercentage(item.percent),
    type: amountType,
  }));
}

function toOverviewTab(
  data: HouseholdChartResult,
  amountType: AmountType,
): ChartOverviewTab {
  const metric = amountType === 'sub' ? 'expense' : 'income';
  const amount = data.summary[metric];
  const pointCount = Math.max(1, data.timeline.length);

  return {
    amount,
    average: math.divide(amount, pointCount).toFixed(2),
    data: data.timeline.map(point => ({
      amount: point[metric],
      data: [],
      displayLabel: point.label,
      tooltipMode: 'aggregate',
      value: point.key,
    })),
    key: `${data.period}-${data.anchorDate}`,
    name: getPeriodName(data),
    ranking: mapCategoryRanking(data, amountType),
  };
}

function hasOverviewData(data: HouseholdChartResult, amountType: AmountType) {
  const metric = amountType === 'sub' ? 'expense' : 'income';
  const isNonZero = (amount: string) => math.compare(amount, 0) !== 0;
  return isNonZero(data.summary[metric])
    || data.timeline.some(point => isNonZero(point[metric]))
    || data.categories.some(item => isNonZero(item.amount))
    || data.members.some(item => isNonZero(item.amount));
}

const ChartsContent: FC<{ household: Household }> = ({ household }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('household');
  const currentAmountType = isAmountType(searchParams.get('amount'))
    ? searchParams.get('amount') as AmountType
    : 'sub';
  const currentTimeRangeCategory = isTimeRangeCategory(searchParams.get('range'))
    ? searchParams.get('range') as TimeRangeCategory
    : 'month';
  const [anchorDate] = useState(() => formatCalendarDate(new Date()));
  const metric = currentAmountType === 'sub' ? 'expense' : 'income';
  const query = useHouseholdChartsQuery({
    params: {
      filters: {
        anchorDate,
        display: 'line',
        metric,
        period: currentTimeRangeCategory,
      },
      householdId: household.id,
    },
    queryOptions: { enabled: true },
  });

  const currentTab = useMemo(
    () => query.data && hasOverviewData(query.data, currentAmountType)
      ? toOverviewTab(query.data, currentAmountType)
      : undefined,
    [currentAmountType, query.data],
  );
  const memberRanking = useMemo(
    () => query.data ? mapMemberRanking(query.data, currentAmountType) : [],
    [currentAmountType, query.data],
  );

  const setCurrentAmountType = useCallback((amountType: AmountType) => {
    setSearchParams((previous) => {
      previous.set('amount', amountType);
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const setCurrentTimeRangeCategory = useCallback((range: TimeRangeCategory) => {
    setSearchParams((previous) => {
      previous.set('range', range);
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const contextValue = useMemo<ChartOverviewContextValue>(() => ({
    additionalRankingSections: memberRanking.length
      ? [{
          items: memberRanking,
          key: 'members',
          title: t('charts.memberRanking'),
        }]
      : [],
    currentAmountType,
    currentTimeRangeCategory,
    curTab: currentTab,
    rankingInteraction: 'none',
    rankingTitle: t('charts.categoryRanking'),
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive: () => undefined,
    tabActive: currentTab?.key ?? '',
    tabs: currentTab ? [currentTab] : [],
  }), [
    currentAmountType,
    currentTab,
    currentTimeRangeCategory,
    memberRanking,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    t,
  ]);

  return (
    <>
      <HouseholdPageState
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        isError={query.isError}
        isLoading={query.isLoading}
        loadingLabel={t('common.loading')}
        onRetry={() => void query.refetch()}
        retryLabel={t('common.retry')}
      >
        <ChartOverviewContext.Provider value={contextValue}>
          <ChartOverviewBody />
        </ChartOverviewContext.Provider>
      </HouseholdPageState>
      <HouseholdBottomNav
        active="charts"
        chartsLabel={t('home.chartsTab')}
        detailsLabel={t('home.detailsTab')}
        onCharts={() => undefined}
        onDetails={() => navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(household.id))}
      />
    </>
  );
};

const HouseholdChartsPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-white">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <ChartsContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdChartsPage;
