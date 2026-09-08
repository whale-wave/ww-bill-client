import type { FC } from 'react';
import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import type { Household, HouseholdChartPeriodOption, HouseholdChartResult } from '@/entities/household';
import type {
  ChartOverviewContextValue,
  ChartOverviewDisplay,
  ChartOverviewPeriodTab,
  ChartOverviewRankingItem,
  ChartOverviewTab,
} from '@/features/chart-overview';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useHouseholdChartPeriodOptionsQuery,
  useHouseholdChartsQuery,
} from '@/entities/household';
import { ChartOverviewContext, ChartOverviewPresentation, getChartPeriodName } from '@/features/chart-overview';
import {
  HouseholdBottomNav,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';
import { HouseholdCategoryPieChart } from './ui/HouseholdCategoryPieChart';

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
  option: HouseholdChartPeriodOption,
  name: string,
): ChartOverviewTab {
  const metric = amountType === 'sub' ? 'expense' : 'income';
  const amount = data.summary[metric];
  const pointCount = Math.max(1, data.timeline.length);

  return {
    anchorDate: data.anchorDate,
    amount,
    average: math.divide(amount, pointCount).toFixed(2),
    data: data.timeline.map(point => ({
      amount: point[metric],
      data: [],
      displayLabel: point.label,
      tooltipMode: 'aggregate',
      value: point.key,
    })),
    key: option.key,
    name,
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
  const { t: chartT } = useTranslation('chart');
  const currentAmountType = isAmountType(searchParams.get('amount'))
    ? searchParams.get('amount') as AmountType
    : 'sub';
  const currentTimeRangeCategory = isTimeRangeCategory(searchParams.get('range'))
    ? searchParams.get('range') as TimeRangeCategory
    : 'month';
  const displayMode: ChartOverviewDisplay = searchParams.get('display') === 'pie' ? 'pie' : 'line';
  const metric = currentAmountType === 'sub' ? 'expense' : 'income';
  const requestedDate = searchParams.get('date');
  const periodScope = `${household.id}:${metric}:${currentTimeRangeCategory}`;
  const bootstrapAnchorRef = useRef<{ anchor?: string; scope: string }>({ scope: '' });
  if (bootstrapAnchorRef.current.scope !== periodScope) {
    bootstrapAnchorRef.current = { anchor: requestedDate ?? undefined, scope: periodScope };
  }
  const periodsQuery = useHouseholdChartPeriodOptionsQuery({
    params: {
      householdId: household.id,
      filters: {
        ...(bootstrapAnchorRef.current.anchor ? { anchorDate: bootstrapAnchorRef.current.anchor } : {}),
        metric,
        pageSize: 6,
        period: currentTimeRangeCategory,
      },
    },
    queryOptions: { enabled: true },
  });
  const selectedOption = useMemo(() => {
    if (!periodsQuery.options.length)
      return undefined;
    return periodsQuery.options.find(option => option.anchorDate === requestedDate)
      ?? periodsQuery.options[periodsQuery.options.length - 1];
  }, [periodsQuery.options, requestedDate]);
  const periodTabs = useMemo<ChartOverviewPeriodTab[]>(
    () => periodsQuery.options.map(option => ({ key: option.key, name: getChartPeriodName(option, chartT) })),
    [chartT, periodsQuery.options],
  );
  useEffect(() => {
    if (!requestedDate || !selectedOption || selectedOption.anchorDate === requestedDate)
      return;
    setSearchParams((previous) => {
      previous.set('date', selectedOption.anchorDate);
      return previous;
    }, { replace: true });
  }, [requestedDate, selectedOption, setSearchParams]);
  const query = useHouseholdChartsQuery({
    params: {
      filters: {
        anchorDate: selectedOption?.anchorDate ?? '',
        display: displayMode,
        metric,
        period: currentTimeRangeCategory,
      },
      householdId: household.id,
    },
    queryOptions: { enabled: Boolean(selectedOption) },
  });
  const prefetchPeriod = query.prefetch;

  const currentTab = useMemo(
    () => selectedOption && query.data && hasOverviewData(query.data, currentAmountType)
      ? toOverviewTab(
          query.data,
          currentAmountType,
          query.data.anchorDate === selectedOption.anchorDate
            ? selectedOption
            : (periodsQuery.options.find(item => item.anchorDate === query.data?.anchorDate) ?? selectedOption),
          getChartPeriodName(
            query.data.anchorDate === selectedOption.anchorDate
              ? selectedOption
              : (periodsQuery.options.find(item => item.anchorDate === query.data?.anchorDate) ?? selectedOption),
            chartT,
          ),
        )
      : undefined,
    [chartT, currentAmountType, periodsQuery.options, query.data, selectedOption],
  );
  const memberRanking = useMemo(
    () => query.data ? mapMemberRanking(query.data, currentAmountType) : [],
    [currentAmountType, query.data],
  );

  const setCurrentAmountType = useCallback((amountType: AmountType) => {
    setSearchParams((previous) => {
      previous.set('amount', amountType);
      previous.delete('date');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const handleDisplayModeChange = useCallback((mode: ChartOverviewDisplay) => {
    setSearchParams((previous) => {
      previous.set('display', mode);
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const setCurrentTimeRangeCategory = useCallback((range: TimeRangeCategory) => {
    setSearchParams((previous) => {
      previous.set('range', range);
      previous.delete('date');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const setTabActive = useCallback((key: string) => {
    const option = periodsQuery.options.find(item => item.key === key);
    if (!option)
      return;
    setSearchParams((previous) => {
      previous.set('date', option.anchorDate);
      return previous;
    }, { replace: true });
  }, [periodsQuery.options, setSearchParams]);

  useEffect(() => {
    if (!query.data || !selectedOption || !prefetchPeriod)
      return;
    periodsQuery.options.forEach((option) => {
      if (option.anchorDate === selectedOption.anchorDate)
        return;
      void prefetchPeriod({
        anchorDate: option.anchorDate,
        display: displayMode,
        metric,
        period: currentTimeRangeCategory,
      });
    });
  }, [currentTimeRangeCategory, displayMode, metric, periodsQuery.options, prefetchPeriod, query.data, selectedOption]);

  const handleRetry = useCallback(() => {
    void periodsQuery.refetch();
    if (selectedOption)
      void query.refetch();
  }, [periodsQuery, query, selectedOption]);

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
    displayMode,
    isContentLoading: Boolean(selectedOption) && query.isLoading && !query.response,
    hasNewerPeriods: periodsQuery.hasPreviousPage,
    hasOlderPeriods: periodsQuery.hasNextPage,
    isLoadingNewerPeriods: periodsQuery.isFetchingPreviousPage,
    isLoadingOlderPeriods: periodsQuery.isFetchingNextPage,
    loadNewerPeriods: () => void periodsQuery.fetchPreviousPage(),
    loadOlderPeriods: () => void periodsQuery.fetchNextPage(),
    onDisplayModeChange: handleDisplayModeChange,
    onRankingItemClick: (item) => {
      if (!query.data)
        return;
      navigate(ROUTES_PATH.HOUSEHOLD_CHART_CATEGORY.getPath(household.id), {
        state: {
          amount: item.amount,
          category: item.category,
          endDate: query.data.endDate,
          percentage: item.percentage,
          periodName: currentTab?.name ?? '',
          startDate: query.data.startDate,
          type: currentAmountType,
        },
      });
    },
    rankingTitle: t('charts.categoryRanking'),
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    tabActive: selectedOption?.key ?? '',
    tabs: periodTabs,
  }), [
    currentAmountType,
    currentTab,
    currentTimeRangeCategory,
    household.id,
    memberRanking,
    navigate,
    displayMode,
    handleDisplayModeChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    selectedOption,
    periodTabs,
    query,
    periodsQuery,
    t,
  ]);

  return (
    <>
      <HouseholdPageState
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        isError={(
          (periodsQuery.isError && !periodsQuery.response)
          || (query.isError && !query.response)
        )}
        isLoading={periodsQuery.isLoading && !periodsQuery.response}
        loadingLabel={t('common.loading')}
        onRetry={handleRetry}
        retryLabel={t('common.retry')}
      >
        <ChartOverviewContext.Provider value={contextValue}>
          <ChartOverviewPresentation
            pieChart={<HouseholdCategoryPieChart ranking={currentTab?.ranking ?? []} />}
          />
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
