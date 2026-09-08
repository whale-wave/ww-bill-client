import type { FC, ReactNode } from 'react';
import type { AmountType, ChartMetric, TimeRangeCategory } from '@/entities/chart';
import type { ChartOverviewContextValue, ChartOverviewDisplay, ChartOverviewTab } from '@/features/chart-overview';
import { format, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useChartPeriodOptionsQuery,
  useChartPeriodQuery,
} from '@/entities/chart';
import { ChartOverviewContext, getChartPeriodName } from '@/features/chart-overview';
import { useTranslation } from '@/shared/i18n';

function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}

function isTimeRangeCategory(value: string | null): value is TimeRangeCategory {
  return value === 'week' || value === 'month' || value === 'year';
}

function toMetric(amountType: AmountType): ChartMetric {
  return amountType === 'sub' ? 'expense' : 'income';
}

function legacyTabToAnchorDate(tab: string, period: TimeRangeCategory) {
  if (!tab)
    return undefined;
  if (period === 'year' && /^\d{4}$/.test(tab))
    return `${tab}-01-01`;
  const match = tab.match(/^(\d{4})-W?(\d{1,2})$/);
  if (!match)
    return undefined;
  const year = Number(match[1]);
  const value = Number(match[2]);
  if (period === 'month' && value >= 1 && value <= 12)
    return `${year}-${String(value).padStart(2, '0')}-01`;
  if (period === 'week' && value >= 1 && value <= 53) {
    const date = startOfISOWeek(setISOWeek(setISOWeekYear(new Date(year, 0, 4), year), value));
    return format(date, 'yyyy-MM-dd');
  }
  return undefined;
}

export const ChartHomeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation('chart');
  const [searchParams, setSearchParams] = useSearchParams();

  const currentAmountType = isAmountType(searchParams.get('amount'))
    ? searchParams.get('amount') as AmountType
    : 'sub';
  const currentTimeRangeCategory = isTimeRangeCategory(searchParams.get('range'))
    ? searchParams.get('range') as TimeRangeCategory
    : 'week';
  const requestedDate = searchParams.get('date');
  const legacyTab = searchParams.get('tab') ?? '';
  const requestedAnchor = requestedDate ?? legacyTabToAnchorDate(legacyTab, currentTimeRangeCategory);
  const displayMode: ChartOverviewDisplay = searchParams.get('display') === 'pie' ? 'pie' : 'line';
  const metric = toMetric(currentAmountType);
  const periodScope = `${metric}:${currentTimeRangeCategory}`;
  const bootstrapAnchorRef = useRef<{ anchor?: string; scope: string }>({ scope: '' });
  if (bootstrapAnchorRef.current.scope !== periodScope) {
    bootstrapAnchorRef.current = { anchor: requestedAnchor, scope: periodScope };
  }

  const periodsQuery = useChartPeriodOptionsQuery({
    params: {
      ...(bootstrapAnchorRef.current.anchor ? { anchorDate: bootstrapAnchorRef.current.anchor } : {}),
      metric,
      pageSize: 6,
      period: currentTimeRangeCategory,
    },
  });
  const selectedOption = periodsQuery.options.find(option => option.anchorDate === requestedAnchor)
    ?? periodsQuery.options.at(-1);
  const detailQuery = useChartPeriodQuery({
    params: {
      anchorDate: selectedOption?.anchorDate ?? '',
      metric,
      period: currentTimeRangeCategory,
    },
    queryOptions: { enabled: Boolean(selectedOption) },
  });
  const prefetchPeriod = detailQuery.prefetch;
  const tabs = useMemo(
    () => periodsQuery.options.map(option => ({ key: option.key, name: getChartPeriodName(option, t) })),
    [periodsQuery.options, t],
  );
  const curTab = useMemo<ChartOverviewTab | undefined>(() => {
    if (!detailQuery.data || !selectedOption)
      return undefined;
    return {
      ...detailQuery.data.tab,
      anchorDate: detailQuery.data.anchorDate,
      name: getChartPeriodName(selectedOption, t),
    };
  }, [detailQuery.data, selectedOption, t]);

  useEffect(() => {
    if (!selectedOption || (!requestedDate && !legacyTab))
      return;
    if (requestedDate === selectedOption.anchorDate && !legacyTab)
      return;
    setSearchParams((previous) => {
      previous.set('date', selectedOption.anchorDate);
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [legacyTab, requestedDate, selectedOption, setSearchParams]);

  useEffect(() => {
    if (!detailQuery.data || !selectedOption || !prefetchPeriod)
      return;
    periodsQuery.options.forEach((option) => {
      if (option.anchorDate === selectedOption.anchorDate)
        return;
      void prefetchPeriod({
        anchorDate: option.anchorDate,
        metric,
        period: currentTimeRangeCategory,
      });
    });
  }, [currentTimeRangeCategory, detailQuery.data, metric, periodsQuery.options, prefetchPeriod, selectedOption]);

  const setTabActive = useCallback((key: string) => {
    const option = periodsQuery.options.find(item => item.key === key);
    if (!option)
      return;
    setSearchParams((previous) => {
      previous.set('date', option.anchorDate);
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [periodsQuery.options, setSearchParams]);

  const setCurrentTimeRangeCategory = useCallback((range: TimeRangeCategory) => {
    setSearchParams((previous) => {
      previous.set('range', range);
      previous.delete('date');
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const setCurrentAmountType = useCallback((type: AmountType) => {
    setSearchParams((previous) => {
      previous.set('amount', type);
      previous.delete('date');
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const handleDisplayModeChange = useCallback((mode: ChartOverviewDisplay) => {
    setSearchParams((previous) => {
      previous.set('display', mode);
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const value = useMemo<ChartOverviewContextValue>(() => ({
    currentAmountType,
    currentTimeRangeCategory,
    curTab,
    displayMode,
    hasNewerPeriods: periodsQuery.hasPreviousPage,
    hasOlderPeriods: periodsQuery.hasNextPage,
    isContentLoading: Boolean(selectedOption) && detailQuery.isLoading && !detailQuery.response,
    isLoadingNewerPeriods: periodsQuery.isFetchingPreviousPage,
    isLoadingOlderPeriods: periodsQuery.isFetchingNextPage,
    loadNewerPeriods: () => void periodsQuery.fetchPreviousPage(),
    loadOlderPeriods: () => void periodsQuery.fetchNextPage(),
    onDisplayModeChange: handleDisplayModeChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    tabActive: selectedOption?.key ?? '',
    tabs,
  }), [
    currentAmountType,
    currentTimeRangeCategory,
    curTab,
    detailQuery,
    displayMode,
    handleDisplayModeChange,
    periodsQuery,
    selectedOption,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    tabs,
  ]);

  return <ChartOverviewContext.Provider value={value}>{children}</ChartOverviewContext.Provider>;
};
