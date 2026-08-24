import type {
  GetChartApiResponse,
  GetChartApiResponseMonthData,
  GetChartApiResponseWeekData,
  GetChartApiResponseYearData,
  MonthTabItem,
  TabItem,
  WeekTabItem,
  YearTabItem,
} from '@/entities/chart';
import { getISOWeek, getISOWeekYear, getMonth, getYear, subMonths, subWeeks, subYears } from 'date-fns';
import {
  isMonthData,
  isWeekData,
  isYearData,
} from '@/entities/chart';
import { i18n } from '@/shared/i18n';

export function deriveWeekTabs(data: GetChartApiResponseWeekData[]): WeekTabItem[] {
  const now = new Date();
  const nowWeek = getISOWeek(now);
  const nowWeekYear = getISOWeekYear(now);
  const previousWeekDate = subWeeks(now, 1);
  const previousWeek = getISOWeek(previousWeekDate);
  const previousWeekYear = getISOWeekYear(previousWeekDate);

  return data.reduce<WeekTabItem[]>((acc, weekDataItem) => {
    acc.push(...weekDataItem.data.map((weekItem): WeekTabItem => {
      const isCurrentWeek = weekDataItem.value === nowWeekYear && weekItem.value === nowWeek;
      const isPreviousWeek = weekDataItem.value === previousWeekYear && weekItem.value === previousWeek;
      let name = '';

      if (isCurrentWeek)
        name = i18n.t('chart:tab.thisWeek');
      else if (isPreviousWeek)
        name = i18n.t('chart:tab.lastWeek');
      else if (weekDataItem.value === nowWeekYear)
        name = i18n.t('chart:tab.weekNumber', { week: weekItem.value });
      else
        name = i18n.t('chart:tab.yearWeekNumber', { year: weekDataItem.value, week: weekItem.value });

      return {
        ...weekItem,
        key: `${weekDataItem.value}-${weekItem.value}`,
        name,
      };
    }));
    return acc;
  }, []);
}

export function deriveMonthTabs(data: GetChartApiResponseMonthData[]): MonthTabItem[] {
  const now = new Date();
  const nowMonth = getMonth(now) + 1;
  const nowYear = getYear(now);
  const previousMonthDate = subMonths(now, 1);
  const previousMonth = getMonth(previousMonthDate) + 1;
  const previousMonthYear = getYear(previousMonthDate);

  return data.reduce<MonthTabItem[]>((acc, monthDataItem) => {
    acc.push(...monthDataItem.data.map((monthItem): MonthTabItem => {
      let name = '';

      if (monthDataItem.value === nowYear && monthItem.value === nowMonth)
        name = i18n.t('chart:tab.thisMonth');
      else if (monthDataItem.value === previousMonthYear && monthItem.value === previousMonth)
        name = i18n.t('chart:tab.lastMonth');
      else if (monthDataItem.value === nowYear)
        name = i18n.t('chart:tab.monthNumber', { month: monthItem.value });
      else
        name = i18n.t('chart:tab.yearMonthNumber', { year: monthDataItem.value, month: monthItem.value });

      return {
        ...monthItem,
        key: `${monthDataItem.value}-${monthItem.value}`,
        name,
      };
    }));
    return acc;
  }, []);
}

export function deriveYearTabs(data: GetChartApiResponseYearData[]): YearTabItem[] {
  return data.map((yearDataItem): YearTabItem => {
    const now = new Date();
    const nowYear = getYear(now);
    const prevYear = getYear(subYears(now, 1));
    let name = '';

    if (yearDataItem.value === nowYear)
      name = i18n.t('chart:tab.thisYear');
    else if (yearDataItem.value === prevYear)
      name = i18n.t('chart:tab.lastYear');
    else
      name = i18n.t('chart:tab.yearNumber', { year: yearDataItem.value });

    return {
      ...yearDataItem,
      key: `${yearDataItem.value}`,
      name,
    };
  });
}

export function deriveChartTabs(data: GetChartApiResponse): TabItem[] {
  if (!data.length)
    return [];
  if (isWeekData(data))
    return deriveWeekTabs(data);
  if (isMonthData(data))
    return deriveMonthTabs(data);
  if (isYearData(data))
    return deriveYearTabs(data);
  return [];
}

export type { TabItem };
