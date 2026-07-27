import type { FC, ReactNode } from 'react';
import type { AmountType, TabItem, TimeRangeCategory } from '@/entities/chart';
import type { ChartOverviewContextValue } from '@/features/chart-overview';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isMonthData, isWeekData, isYearData, useGetChartQuery } from '@/entities/chart';
import { ChartOverviewContext } from '@/features/chart-overview';
import { deriveMonthTabs, deriveWeekTabs, deriveYearTabs } from './derive-tabs';

function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}

function isTimeRangeCategory(value: string | null): value is TimeRangeCategory {
  return value === 'week' || value === 'month' || value === 'year';
}

export const ChartHomeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentAmountType = isAmountType(searchParams.get('amount'))
    ? searchParams.get('amount') as AmountType
    : 'sub';
  const currentTimeRangeCategory = isTimeRangeCategory(searchParams.get('range'))
    ? searchParams.get('range') as TimeRangeCategory
    : 'week';
  const urlTab = searchParams.get('tab') ?? '';

  const { data } = useGetChartQuery({
    params: {
      type: currentAmountType,
      category: currentTimeRangeCategory,
    },
  });

  const tabs = useMemo<TabItem[]>(() => {
    if (!data || !data.length)
      return [];
    if (isWeekData(data))
      return deriveWeekTabs(data);
    if (isMonthData(data))
      return deriveMonthTabs(data);
    if (isYearData(data))
      return deriveYearTabs(data);
    return [];
  }, [data]);

  const curTab = useMemo<TabItem | undefined>(() => {
    if (!tabs.length)
      return undefined;
    return tabs.find(tab => tab.key === urlTab) ?? tabs.at(-1);
  }, [tabs, urlTab]);

  const tabActive = curTab?.key ?? '';

  const setTabActive = useCallback((key: string) => {
    setSearchParams(
      (prev) => {
        prev.set('tab', key);
        return prev;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const setCurrentTimeRangeCategory = useCallback((range: TimeRangeCategory) => {
    setSearchParams(
      (prev) => {
        prev.set('range', range);
        prev.delete('tab');
        return prev;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const setCurrentAmountType = useCallback((type: AmountType) => {
    setSearchParams(
      (prev) => {
        prev.set('amount', type);
        prev.delete('tab');
        return prev;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const value = useMemo<ChartOverviewContextValue>(
    () => ({
      currentAmountType,
      currentTimeRangeCategory,
      tabActive,
      tabs,
      curTab,
      setTabActive,
      setCurrentTimeRangeCategory,
      setCurrentAmountType,
    }),
    [currentAmountType, currentTimeRangeCategory, tabActive, tabs, curTab, setTabActive, setCurrentTimeRangeCategory, setCurrentAmountType],
  );

  return <ChartOverviewContext.Provider value={value}>{children}</ChartOverviewContext.Provider>;
};
