import type { CategoryEntity } from '@/entities/category';
import type { UserEntity } from '@/entities/user';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export enum BudgetEntityLevel {
  SUMMARY = 0,
  CATEGORY = 1,
}

export enum BudgetEntityType {
  MONTH = 0,
  YEAR = 1,
}

export interface GetBudgetInfoApiParams {
  type: BudgetEntityType;
}

export interface GetLedgerBudgetInfoApiParams extends GetBudgetInfoApiParams {
  periodStart?: string;
}

export interface BudgetInfo {
  id: string;
  category?: CategoryEntity;
  budgetAmount: number;
  amount: number;
  remaining: number;
  remainingPercentage: string;
}

export interface GetBudgetInfoApiResponseData {
  summaryBudget?: BudgetInfo;
  categoryBudgets?: BudgetInfo[];
}

export function getBudgetInfoApi(params: GetBudgetInfoApiParams) {
  return request.get<unknown, SuccessResponse<GetBudgetInfoApiResponseData>>(`/budget/info`, {
    params,
  });
}

export function getLedgerBudgetInfoApi(
  ledgerId: string,
  params: GetLedgerBudgetInfoApiParams,
) {
  return request.get<unknown, SuccessResponse<GetBudgetInfoApiResponseData>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/info`,
    { params },
  );
}

export interface BudgetEntity {
  id: string;
  amount: string;
  level: BudgetEntityLevel;
  type: BudgetEntityType;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryEntity;
  user: UserEntity;
}

export interface PostBudgetSummaryApiData extends Omit<BudgetEntity, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'user' | 'level'> {
}

export function postBudgetSummaryApi(data: PostBudgetSummaryApiData) {
  return request.post<unknown, SuccessResponse<unknown>>(`/budget/summary`, data);
}

export interface PostBudgetCategoryApiData extends Omit<BudgetEntity, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'user' | 'level'> {
  category: number;
}

export function postBudgetCategoryApi(data: PostBudgetCategoryApiData) {
  return request.post<unknown, SuccessResponse<unknown>>(`/budget/category`, data);
}

export interface PostBudgetClearApiData {
  type: BudgetEntityType;
}

export function postBudgetClearApi(data: PostBudgetClearApiData) {
  return request.post<unknown, SuccessResponse<unknown>>(`/budget/clear`, data);
}

export interface DeleteBudgetCategoryByBudgetIdApiData {
  type: BudgetEntityType;
}

export function deleteBudgetCategoryByBudgetIdApi(budgetId: string | number, data: DeleteBudgetCategoryByBudgetIdApiData) {
  return request.delete<unknown, SuccessResponse<unknown>>(`/budget/category/${budgetId}`, { data });
}

export interface PatchBudgetAmountByBudgetIdApiData {
  amount: string;
  type: BudgetEntityType;
}

export function patchBudgetAmountByBudgetIdApi(budgetId: string | number, data: PatchBudgetAmountByBudgetIdApiData) {
  return request.patch<unknown, SuccessResponse<unknown>>(`/budget/${budgetId}/amount`, data);
}

export interface LedgerBudgetPeriodData {
  type: BudgetEntityType;
  periodStart?: string;
}

export interface PostLedgerBudgetSummaryApiData extends LedgerBudgetPeriodData {
  amount: string;
}

export function postLedgerBudgetSummaryApi(
  ledgerId: string,
  data: PostLedgerBudgetSummaryApiData,
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/summary`,
    data,
  );
}

export interface PostLedgerBudgetCategoryApiData extends PostLedgerBudgetSummaryApiData {
  category: number;
}

export function postLedgerBudgetCategoryApi(
  ledgerId: string,
  data: PostLedgerBudgetCategoryApiData,
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/category`,
    data,
  );
}

export function postLedgerBudgetClearApi(
  ledgerId: string,
  data: LedgerBudgetPeriodData,
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/clear`,
    data,
  );
}

export function deleteLedgerBudgetCategoryApi(
  ledgerId: string,
  budgetId: string,
  data: LedgerBudgetPeriodData,
) {
  return request.delete<unknown, SuccessResponse<unknown>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/category/${encodeURIComponent(budgetId)}`,
    { data },
  );
}

export interface PatchLedgerBudgetAmountApiData extends LedgerBudgetPeriodData {
  amount: string;
}

export function patchLedgerBudgetAmountApi(
  ledgerId: string,
  budgetId: string,
  data: PatchLedgerBudgetAmountApiData,
) {
  return request.patch<unknown, SuccessResponse<unknown>>(
    `/ledgers/${encodeURIComponent(ledgerId)}/budgets/${encodeURIComponent(budgetId)}/amount`,
    data,
  );
}
