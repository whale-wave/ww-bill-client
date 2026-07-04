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

export function deriveWeekTabs(data: GetChartApiResponseWeekData[]): WeekTabItem[] {
  return data.reduce<WeekTabItem[]>((acc, weekDataItem) => {
    acc.push(...weekDataItem.data.map((weekItem): WeekTabItem => {
      const now = new Date();
      const nowWeek = getWeek(now);
      const prevWeek = getWeek(subWeeks(now, 1));
      const isCurrentYear = isSameYear(now, new Date(String(`${weekDataItem.value}`)));
      let name = '';

      if (nowWeek === weekItem.value) {
        name = '本周';
      }
      else if (prevWeek === weekItem.value) {
        name = '上周';
      }
      else if (isCurrentYear) {
        name = `${weekItem.value}周`;
      }
      else {
        name = `${weekDataItem.value}-${weekItem.value}周`;
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
          name = '本月';
        }
        else if (prevMonth === monthItem.value) {
          name = '上月';
        }
        else {
          name = `${monthItem.value}月`;
        }
      }
      else {
        name = `${monthDataItem.value}-${monthItem.value}月`;
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
      name = '今年';
    }
    else if (yearDataItem.value === prevYear) {
      name = '去年';
    }
    else {
      name = `${yearDataItem.value}年`;
    }

    return {
      ...yearDataItem,
      name,
      key: `${yearDataItem.value}`,
    };
  });
}

export type { TabItem };
