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
import { getISOWeek, getISOWeekYear, getMonth, getYear, subMonths, subYears } from 'date-fns';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useHouseholdChartPeriodsQuery, useHouseholdChartsQuery } from '@/entities/household';
import { ChartOverviewContext, ChartOverviewPresentation } from '@/features/chart-overview';
import {
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

function getShanghaiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(`${values.year}-${values.month}-${values.day}T12:00:00`);
}

function getMonthPeriodName(
  option: Extract<HouseholdChartPeriodOption, { period: 'month' }>,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const now = getShanghaiToday();
  const currentMonth = getMonth(now) + 1;
  const currentYear = getYear(now);
  const previousMonthDate = subMonths(now, 1);
  const previousMonth = getMonth(previousMonthDate) + 1;
  const previousMonthYear = getYear(previousMonthDate);
  if (option.year === currentYear && option.month === currentMonth)
    return t('tab.thisMonth');
  if (option.year === previousMonthYear && option.month === previousMonth)
    return t('tab.lastMonth');
  if (option.year === currentYear)
    return t('tab.monthNumber', { month: option.month });
  return t('tab.yearMonthNumber', { year: option.year, month: option.month });
}

function getPeriodName(option: HouseholdChartPeriodOption, t: (key: string, options?: Record<string, unknown>) => string) {
  if (option.period === 'week') {
    const now = getShanghaiToday();
    const currentKey = `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
    const previous = new Date(now);
    previous.setDate(previous.getDate() - 7);
    const previousKey = `${getISOWeekYear(previous)}-W${String(getISOWeek(previous)).padStart(2, '0')}`;
    if (option.key === currentKey)
      return t('tab.thisWeek');
    if (option.key === previousKey)
      return t('tab.lastWeek');
    return option.isoWeekYear === getISOWeekYear(now)
      ? t('tab.weekNumber', { week: option.isoWeek })
      : t('tab.yearWeekNumber', { year: option.isoWeekYear, week: option.isoWeek });
  }
  if (option.period === 'month')
    return getMonthPeriodName(option, t);
  const currentYear = getYear(getShanghaiToday());
  const previousYear = getYear(subYears(getShanghaiToday(), 1));
  if (option.year === currentYear)
    return t('tab.thisYear');
  if (option.year === previousYear)
    return t('tab.lastYear');
  return t('tab.yearNumber', { year: option.year });
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
  const periodsQuery = useHouseholdChartPeriodsQuery({
    params: { householdId: household.id, filters: { metric, period: currentTimeRangeCategory } },
    queryOptions: { enabled: true },
  });
  const selectedOption = useMemo(() => {
    if (!periodsQuery.data.length)
      return undefined;
    return periodsQuery.data.find(option => option.anchorDate === requestedDate)
      ?? periodsQuery.data[periodsQuery.data.length - 1];
  }, [periodsQuery.data, requestedDate]);
  const periodTabs = useMemo<ChartOverviewPeriodTab[]>(
    () => periodsQuery.data.map(option => ({ key: option.key, name: getPeriodName(option, chartT) })),
    [chartT, periodsQuery.data],
  );
  useEffect(() => {
    if (!selectedOption || selectedOption.anchorDate === requestedDate)
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

  const currentTab = useMemo(
    () => selectedOption
      && query.data
      && query.data.anchorDate === selectedOption.anchorDate
      && hasOverviewData(query.data, currentAmountType)
      ? toOverviewTab(query.data, currentAmountType, selectedOption!, getPeriodName(selectedOption!, chartT))
      : undefined,
    [chartT, currentAmountType, query.data, selectedOption],
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
    const option = periodsQuery.data.find(item => item.key === key);
    if (!option)
      return;
    setSearchParams((previous) => {
      previous.set('date', option.anchorDate);
      return previous;
    }, { replace: true });
  }, [periodsQuery.data, setSearchParams]);

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
    isContentLoading: Boolean(selectedOption) && query.isFetching,
    onDisplayModeChange: handleDisplayModeChange,
    rankingInteraction: 'none',
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
    memberRanking,
    displayMode,
    handleDisplayModeChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    selectedOption,
    periodTabs,
    query.isFetching,
    t,
  ]);

  return (
    <>
      <HouseholdPageState
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        isError={periodsQuery.isError || query.isError}
        isLoading={periodsQuery.isLoading}
        loadingLabel={t('common.loading')}
        onRetry={handleRetry}
        retryLabel={t('common.retry')}
      >
        <ChartOverviewContext.Provider value={contextValue}>
          <ChartOverviewPresentation />
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
