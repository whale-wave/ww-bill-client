import type { FC, ReactNode } from 'react';
import type { AmountType, ChartMetric, TimeRangeCategory } from '@/entities/chart';
import type { ChartOverviewContextValue, ChartOverviewCustomRange, ChartOverviewDisplay, ChartOverviewTab } from '@/features/chart-overview';
import { format, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChartPeriodOptionsQuery, useChartPeriodQuery } from '@/entities/chart';
import { ChartOverviewContext, getChartPeriodName } from '@/features/chart-overview';
import { useTranslation } from '@/shared/i18n';

function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}
function isTimeRangeCategory(value: string | null): value is TimeRangeCategory {
  return value === 'week' || value === 'month' || value === 'year';
}
function readCustomRange(searchParams: URLSearchParams): ChartOverviewCustomRange | undefined {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  return startDate && endDate ? { endDate, startDate } : undefined;
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
  if (period === 'week' && value >= 1 && value <= 53)
    return format(startOfISOWeek(setISOWeek(setISOWeekYear(new Date(year, 0, 4), year), value)), 'yyyy-MM-dd');
  return undefined;
}

export const ChartHomeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation('chart');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentAmountType = isAmountType(searchParams.get('amount')) ? searchParams.get('amount') as AmountType : 'sub';
  const customRange = readCustomRange(searchParams);
  const isCustomRange = searchParams.get('range') === 'custom' && Boolean(customRange);
  const currentTimeRangeCategory = isCustomRange ? 'custom' as const : isTimeRangeCategory(searchParams.get('range')) ? searchParams.get('range') as TimeRangeCategory : 'week';
  const fixedPeriod = currentTimeRangeCategory === 'custom' ? 'month' : currentTimeRangeCategory;
  const requestedDate = searchParams.get('date');
  const legacyTab = searchParams.get('tab') ?? '';
  const requestedAnchor = requestedDate ?? legacyTabToAnchorDate(legacyTab, fixedPeriod);
  const displayMode: ChartOverviewDisplay = searchParams.get('display') === 'pie' ? 'pie' : 'line';
  const metric = toMetric(currentAmountType);
  const scope = `${metric}:${currentTimeRangeCategory}:${customRange?.startDate ?? ''}:${customRange?.endDate ?? ''}`;
  const bootstrapAnchorRef = useRef<{ anchor?: string; scope: string }>({ scope: '' });
  if (bootstrapAnchorRef.current.scope !== scope)
    bootstrapAnchorRef.current = { anchor: requestedAnchor, scope };
  const periodsQuery = useChartPeriodOptionsQuery({ params: { ...(bootstrapAnchorRef.current.anchor ? { anchorDate: bootstrapAnchorRef.current.anchor } : {}), metric, pageSize: 6, period: fixedPeriod }, queryOptions: { enabled: !isCustomRange } });
  const selectedOption = periodsQuery.options.find(option => option.anchorDate === requestedAnchor) ?? periodsQuery.options.at(-1);
  const detailQuery = useChartPeriodQuery({
    params: { anchorDate: customRange?.startDate.slice(0, 10) ?? selectedOption?.anchorDate ?? '', metric, period: fixedPeriod, ...(customRange ? { endDate: `${customRange.endDate}+08:00`, startDate: `${customRange.startDate}+08:00` } : {}) },
    queryOptions: { enabled: isCustomRange || Boolean(selectedOption) },
  });
  const tabs = useMemo(() => isCustomRange ? [] : periodsQuery.options.map(option => ({ key: option.key, name: getChartPeriodName(option, t) })), [isCustomRange, periodsQuery.options, t]);
  const curTab = useMemo<ChartOverviewTab | undefined>(() => {
    if (!detailQuery.data || (!isCustomRange && !selectedOption))
      return undefined;
    return { ...detailQuery.data.tab, anchorDate: detailQuery.data.anchorDate, name: isCustomRange && customRange ? `${customRange.startDate.replace('T', ' ')} — ${customRange.endDate.replace('T', ' ')}` : getChartPeriodName(selectedOption!, t) };
  }, [customRange, detailQuery.data, isCustomRange, selectedOption, t]);
  useEffect(() => {
    if (isCustomRange || !selectedOption || (!requestedDate && !legacyTab) || (requestedDate === selectedOption.anchorDate && !legacyTab))
      return;
    setSearchParams((previous) => {
      previous.set('date', selectedOption.anchorDate);
      previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [isCustomRange, legacyTab, requestedDate, selectedOption, setSearchParams]);
  const setTabActive = useCallback((key: string) => {
    const option = periodsQuery.options.find(item => item.key === key);
    if (option) {
      setSearchParams((previous) => {
        previous.set('date', option.anchorDate);
        previous.delete('tab');
        return previous;
      }, { replace: true });
    }
  }, [periodsQuery.options, setSearchParams]);
  const setCurrentTimeRangeCategory = useCallback((range: TimeRangeCategory) => {
    setSearchParams((previous) => {
      previous.set('range', range);
      previous.delete('date');
      previous.delete('tab');
      previous.delete('startDate');
      previous.delete('endDate');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);
  const onCustomRangeChange = useCallback((range: ChartOverviewCustomRange) => {
    setSearchParams((previous) => {
      previous.set('range', 'custom');
      previous.set('startDate', range.startDate);
      previous.set('endDate', range.endDate);
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
    customRange,
    displayMode,
    hasNewerPeriods: isCustomRange ? false : periodsQuery.hasPreviousPage,
    hasOlderPeriods: isCustomRange ? false : periodsQuery.hasNextPage,
    isContentLoading: (isCustomRange || Boolean(selectedOption)) && detailQuery.isLoading && !detailQuery.response,
    isLoadingNewerPeriods: periodsQuery.isFetchingPreviousPage,
    isLoadingOlderPeriods: periodsQuery.isFetchingNextPage,
    loadNewerPeriods: () => void periodsQuery.fetchPreviousPage(),
    loadOlderPeriods: () => void periodsQuery.fetchNextPage(),
    onCustomRangeChange,
    onDisplayModeChange: handleDisplayModeChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
    setTabActive,
    tabActive: isCustomRange ? '' : selectedOption?.key ?? '',
    tabs,
  }), [currentAmountType, currentTimeRangeCategory, curTab, customRange, detailQuery, displayMode, handleDisplayModeChange, isCustomRange, onCustomRangeChange, periodsQuery, selectedOption, setCurrentAmountType, setCurrentTimeRangeCategory, setTabActive, tabs]);
  return <ChartOverviewContext.Provider value={value}>{children}</ChartOverviewContext.Provider>;
};
