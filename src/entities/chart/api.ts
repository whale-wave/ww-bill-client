import type { CategoryEntity } from '@/entities/category';
import type { RecordEntry } from '@/entities/record';
import { request } from '@/shared/api';

export interface GetChartApiResponseRankingData {
  amount: number;
  category: CategoryEntity;
  percentage: string;
  type: 'sub' | 'add';
}
export interface GetChartApiResponseWeekDataWeekItemDayItem {
  type: 'day';
  value: string;
  amount: number;
  data: RecordEntry[];
}
export interface GetChartApiResponseWeekDataWeekItem {
  type: 'week';
  value: number;
  amount: number;
  average: string;
  data: GetChartApiResponseWeekDataWeekItemDayItem[];
  ranking: GetChartApiResponseRankingData[];
}
export interface GetChartApiResponseWeekData {
  type: 'year';
  value: number;
  amount: number;
  data: GetChartApiResponseWeekDataWeekItem[];
}

export interface GetChartApiResponseMonthDataDayItem {
  amount: number;
  data: RecordEntry[];
  type: 'day';
  value: string;
}

export interface GetChartApiResponseMonthDataMonthItem {
  amount: number;
  average: string;
  data: GetChartApiResponseMonthDataDayItem[];
  ranking: GetChartApiResponseRankingData[];
  type: 'month';
  value: number;
}

export interface GetChartApiResponseMonthData {
  amount: number;
  data: GetChartApiResponseMonthDataMonthItem[];
  type: 'year';
  value: number;
}

export interface GetChartApiResponseYearDataMonthItem {
  amount: number;
  data: RecordEntry[];
  type: 'month';
  value: string;
}

export interface GetChartApiResponseYearData {
  amount: number;
  average: string;
  data: GetChartApiResponseYearDataMonthItem[];
  ranking: GetChartApiResponseRankingData[];
  type: 'year';
  value: number;
}

export type GetChartApiParamsCategory = 'week' | 'month' | 'year';

export interface GetChartApiParams {
  type: 'sub' | 'add';
  category: GetChartApiParamsCategory;
  categoryId?: string;
}

export type GetChartApiResponse = GetChartApiResponseWeekData[] | GetChartApiResponseMonthData[] | GetChartApiResponseYearData[];

export function getChartApi(params: GetChartApiParams) {
  return request.get<unknown, SuccessResponse<GetChartApiResponse>>('/chart', {
    params,
  });
}
