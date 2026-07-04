import type {
  GetChartApiResponseMonthDataMonthItem,
  GetChartApiResponseWeekDataWeekItem,
  GetChartApiResponseYearData,
} from './api';

export type TimeRangeCategory = 'week' | 'month' | 'year';

export type AmountType = 'sub' | 'add';

export interface WeekTabItem extends GetChartApiResponseWeekDataWeekItem {
  name: string;
  key: string;
}

export interface MonthTabItem extends GetChartApiResponseMonthDataMonthItem {
  name: string;
  key: string;
}

export interface YearTabItem extends GetChartApiResponseYearData {
  name: string;
  key: string;
}

export type TabItem = WeekTabItem | MonthTabItem | YearTabItem;
