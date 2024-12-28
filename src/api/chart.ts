import type { CategoryEntity } from './category';
import type { RecordEntry } from './record';
import { request } from '@/utils';

export interface GetChartApiResponseRankingData {
  type: 'sub' | 'add';
  percentage: string;
  amount: number;
  category: CategoryEntity;
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

export interface GetChartApiParams {
  type: 'sub' | 'add';
  category: 'week' | 'month' | 'year';
  categoryId?: string;
}

export function getChartApi(params: GetChartApiParams) {
  return request.get<unknown, SuccessResponse<GetChartApiResponseWeekData[]>>('/chart', {
    params,
  });
}
