import type { RecordEntry } from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface GetRecordByIdApiParams {
  id: string;
}

export function getRecordByIdApi(getRecordByIdApiParams: GetRecordByIdApiParams) {
  return request.get<unknown, SuccessResponse<RecordEntry>>(`/record/${getRecordByIdApiParams.id}`);
}

export interface MonthBillCategoryAmount {
  categoryId: number;
  name: string;
  icon?: string;
  sortOrder: number;
  amount: string;
  percentage: number;
}

export interface MonthBillDetailResponse {
  month: string;
  summary: {
    income: string;
    expense: string;
    balance: string;
    recordDays: number;
    recordCount: number;
  };
  expense: {
    highestDay: { date: string; amount: string } | null;
    averageDaily: string;
    categories: MonthBillCategoryAmount[];
    dailyTrend: Array<{ date: string; amount: string }>;
    monthlyTrend: Array<{ month: string; amount: string }>;
    categoryChanges: Array<{
      categoryId: number;
      name: string;
      icon?: string;
      sortOrder: number;
      direction: 'increase' | 'decrease';
      amount: string;
    }>;
  };
  income: {
    categories: MonthBillCategoryAmount[];
    monthlyTrend: Array<{ month: string; amount: string }>;
  };
  achievement: {
    streakDays: number;
    totalRecordDays: number;
    totalRecordCount: number;
  };
}

export function getMonthBillDetailApi(month: string) {
  return request.get<unknown, SuccessResponse<MonthBillDetailResponse>>(
    '/record/bill/month-detail',
    { params: { month } },
  );
}

export interface GetRecordApiResponseData {
  total: number;
  data: RecordEntry[];
  expend: number;
  income: number;
}

export interface GetRecordApiParams {
  startDate?: string | number;
  endDate?: string;
  keyword?: string;
  keywordTarget?: RecordKeywordTarget;
  type?: 'add' | 'sub';
  dateMode?: RecordDateMode;
}

export type RecordKeywordTarget = 'all' | 'category' | 'tag' | 'remark' | 'amount';
export type RecordDateMode = 'range';

export interface RecordFilterCategory {
  icon: string;
  iconType: 'BUILTIN' | 'IMAGE';
  id: number;
  name: string;
  sortOrder: number;
  status: 'ACTIVE' | 'ARCHIVED';
  type: 'add' | 'sub';
}

export interface RecordFilterTag {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface RecordFilterOptionsData {
  capabilities: {
    category: boolean;
    tag: boolean;
  };
  categories: RecordFilterCategory[];
  tags: RecordFilterTag[];
}

// 获取记录
export function getRecordApi(params?: GetRecordApiParams) {
  return request.get<unknown, SuccessResponse<GetRecordApiResponseData>>(
    '/record',
    {
      params,
    },
  );
}

export function getLedgerRecordsApi(
  ledgerId: string,
  params?: GetRecordApiParams,
) {
  return request.get<unknown, SuccessResponse<GetRecordApiResponseData>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records`,
    { params },
  );
}

export function getRecordFilterOptionsApi(ledgerId?: string) {
  const path = ledgerId
    ? `/ledgers/${encodeURIComponent(ledgerId)}/records/filter-options`
    : '/record/filter-options';
  return request.get<unknown, SuccessResponse<RecordFilterOptionsData>>(path);
}

export function getLedgerRecordByIdApi(ledgerId: string, recordId: string) {
  return request.get<unknown, SuccessResponse<RecordEntry>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records/${encodeURIComponent(recordId)}`,
  );
}

export interface PostRecordApiData {
  remark: string;
  categoryId: number;
  type: 'add' | 'sub';
  amount: string;
  time: string;
  tagIds?: string[];
}

// 创建记录
export function postRecordApi(data: PostRecordApiData) {
  return request.post<unknown, SuccessResponse<undefined>>(`/record`, data);
}

export function postLedgerRecordApi(ledgerId: string, data: PostRecordApiData) {
  return request.post<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records`,
    data,
  );
}

export interface PutRecordApiData extends Partial<PostRecordApiData> {
  version: number;
}

// 更新记录
export function putRecordApi(id: string, data: PutRecordApiData) {
  return request.put<unknown, SuccessResponse<undefined>>(
    `/record/${id}`,
    data,
  );
}

export function putLedgerRecordApi(
  ledgerId: string,
  recordId: string,
  data: PutRecordApiData,
) {
  return request.put<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records/${encodeURIComponent(recordId)}`,
    data,
  );
}

// 删除记录
export function deleteRecordApi(id: string, version: number) {
  return request.delete<unknown, SuccessResponse<undefined>>(`/record/${id}`, {
    params: { version },
  });
}

export function deleteLedgerRecordApi(
  ledgerId: string,
  recordId: string,
  version: number,
) {
  return request.delete<unknown, SuccessResponse<undefined>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records/${encodeURIComponent(recordId)}`,
    { params: { version } },
  );
}

export interface Bill {
  income: number;
  expand: number;
  balance: number;
}

export interface GetRecordBillApiParams {
  type: 'all' | 'year';
  year?: number;
}

export interface GetRecordBillApiResponseData {
  list: {
    [monthOrYear: string]: Bill;
  };
  all: Bill;
  earliestMonth?: string | null;
}

// 获取账单
export function getRecordBillApi(params: GetRecordBillApiParams) {
  return request.get<unknown, SuccessResponse<GetRecordBillApiResponseData>>(
    `/record/bill`,
    {
      params,
    },
  );
}

export function getLedgerRecordBillApi(
  ledgerId: string,
  params: GetRecordBillApiParams,
) {
  return request.get<unknown, SuccessResponse<GetRecordBillApiResponseData>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/records/bill`,
    { params },
  );
}

export function getHouseholdRecordBillApi(
  householdId: string,
  params: GetRecordBillApiParams,
) {
  return request.get<unknown, SuccessResponse<GetRecordBillApiResponseData>>(
    `/households/${encodeURIComponent(householdId)}/records/bill`,
    { params },
  );
}
