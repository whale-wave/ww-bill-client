import type { CategoryEntity } from '@/entities/category';
import type { RecordEntry } from '@/entities/record';
import type { SuccessResponse } from '@/shared/api';
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

export interface TagRankingResponse {
  totalAmount: string;
  items: Array<{
    key: string;
    tagId: string | null;
    name: string;
    amount: string;
    percentage: number;
  }>;
}

export interface GetTagRankingParams {
  type: 'sub' | 'add';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

export type GetChartApiResponse = GetChartApiResponseWeekData[] | GetChartApiResponseMonthData[] | GetChartApiResponseYearData[];

export type ChartMetric = 'expense' | 'income' | 'net';

export interface ChartWeekPeriodOption {
  period: 'week';
  key: string;
  anchorDate: string;
  isoWeekYear: number;
  isoWeek: number;
}

export interface ChartMonthPeriodOption {
  period: 'month';
  key: string;
  anchorDate: string;
  year: number;
  month: number;
}

export interface ChartYearPeriodOption {
  period: 'year';
  key: string;
  anchorDate: string;
  year: number;
}

export type ChartPeriodOption = ChartWeekPeriodOption | ChartMonthPeriodOption | ChartYearPeriodOption;

export interface ChartPeriodOptionsPage {
  current: number;
  data: ChartPeriodOption[];
  pageSize: number;
  total: number;
}

export interface GetChartPeriodOptionsApiParams {
  period: GetChartApiParamsCategory;
  metric: ChartMetric;
  anchorDate?: string;
  current?: number;
  pageSize?: number;
}

export interface GetChartPeriodApiParams {
  period: GetChartApiParamsCategory;
  metric: ChartMetric;
  anchorDate: string;
  categoryId?: number;
}

export interface ChartPeriodResult {
  anchorDate: string;
  endDate: string;
  metric: ChartMetric;
  period: GetChartApiParamsCategory;
  startDate: string;
  tab: {
    amount: number;
    average: string;
    data: Array<{
      amount: number;
      data: RecordEntry[];
      displayLabel: string;
      tooltipMode?: 'aggregate';
      type: 'day' | 'month';
      value: string;
    }>;
    key: string;
    ranking: GetChartApiResponseRankingData[];
  };
}

export function getChartApi(params: GetChartApiParams) {
  return request.get<unknown, SuccessResponse<GetChartApiResponse>>('/chart', {
    params,
  });
}

export function getLedgerChartApi(
  ledgerId: string,
  params: GetChartApiParams,
) {
  return request.get<unknown, SuccessResponse<GetChartApiResponse>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/charts`,
    { params },
  );
}

export function getChartPeriodOptionsApi(params: GetChartPeriodOptionsApiParams) {
  return request.get<unknown, SuccessResponse<ChartPeriodOptionsPage>>('/chart/period-options', { params });
}

export function getLedgerChartPeriodOptionsApi(
  ledgerId: string,
  params: GetChartPeriodOptionsApiParams,
) {
  return request.get<unknown, SuccessResponse<ChartPeriodOptionsPage>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/charts/period-options`,
    { params },
  );
}

export function getChartPeriodApi(params: GetChartPeriodApiParams) {
  return request.get<unknown, SuccessResponse<ChartPeriodResult>>('/chart/period', { params });
}

export function getLedgerChartPeriodApi(ledgerId: string, params: GetChartPeriodApiParams) {
  return request.get<unknown, SuccessResponse<ChartPeriodResult>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/charts/period`,
    { params },
  );
}

export function getTagRankingApi(params: GetTagRankingParams) {
  return request.get<unknown, SuccessResponse<TagRankingResponse>>('/chart/tag-ranking', { params });
}

export function getLedgerTagRankingApi(ledgerId: string, params: GetTagRankingParams) {
  return request.get<unknown, SuccessResponse<TagRankingResponse>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/charts/tag-ranking`,
    { params },
  );
}
