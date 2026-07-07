import type {
  GetChartApiResponseMonthData,
  GetChartApiResponseWeekData,
  GetChartApiResponseYearData,
  MonthTabItem,
  TabItem,
  WeekTabItem,
  YearTabItem,
} from '@/entities/chart';
import { getMonth, getWeek, getYear, isSameYear, subMonths, subWeeks, subYears } from 'date-fns';
import { i18n } from '@/shared/i18n';

export function deriveWeekTabs(data: GetChartApiResponseWeekData[]): WeekTabItem[] {
  return data.reduce<WeekTabItem[]>((acc, weekDataItem) => {
    acc.push(...weekDataItem.data.map((weekItem): WeekTabItem => {
      const now = new Date();
      const nowWeek = getWeek(now);
      const prevWeek = getWeek(subWeeks(now, 1));
      const isCurrentYear = isSameYear(now, new Date(String(`${weekDataItem.value}`)));
      let name = '';

      if (nowWeek === weekItem.value) {
        name = i18n.t('chart:tab.thisWeek');
      }
      else if (prevWeek === weekItem.value) {
        name = i18n.t('chart:tab.lastWeek');
      }
      else if (isCurrentYear) {
        name = i18n.t('chart:tab.weekNumber', { week: weekItem.value });
      }
      else {
        name = i18n.t('chart:tab.yearWeekNumber', { year: weekDataItem.value, week: weekItem.value });
      }

      return {
        ...weekItem,
        name,
        key: `${weekDataItem.value}-${weekItem.value}`,
      };
    }));
    return acc;
  }, []);
}

export function deriveMonthTabs(data: GetChartApiResponseMonthData[]): MonthTabItem[] {
  return data.reduce<MonthTabItem[]>((acc, monthDataItem) => {
    acc.push(...monthDataItem.data.map((monthItem): MonthTabItem => {
      const now = new Date();
      const nowMonth = getMonth(now) + 1;
      const prevMonth = getMonth(subMonths(now, 1)) + 1;
      const isCurrentYear = isSameYear(now, new Date(`${monthDataItem.value}`));
      let name = '';

      if (isCurrentYear) {
        if (nowMonth === monthItem.value) {
          name = i18n.t('chart:tab.thisMonth');
        }
        else if (prevMonth === monthItem.value) {
          name = i18n.t('chart:tab.lastMonth');
        }
        else {
          name = i18n.t('chart:tab.monthNumber', { month: monthItem.value });
        }
      }
      else {
        name = i18n.t('chart:tab.yearMonthNumber', { year: monthDataItem.value, month: monthItem.value });
      }

      return {
        ...monthItem,
        name,
        key: `${monthDataItem.value}-${monthItem.value}`,
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

    if (yearDataItem.value === nowYear) {
      name = i18n.t('chart:tab.thisYear');
    }
    else if (yearDataItem.value === prevYear) {
      name = i18n.t('chart:tab.lastYear');
    }
    else {
      name = i18n.t('chart:tab.yearNumber', { year: yearDataItem.value });
    }

    return {
      ...yearDataItem,
      name,
      key: `${yearDataItem.value}`,
    };
  });
}

export type { TabItem };
