import { request } from '@/utils';
import type { CategoryEntity } from '@/api/category.ts';

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
