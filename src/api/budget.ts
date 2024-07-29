import { request } from '@/utils';
import type { CategoryEntity } from '@/api/category.ts';
import type { UserEntity } from '@/api/system.ts';

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

export interface BudgetInfo {
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
