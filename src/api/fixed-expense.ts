import { request } from '@/utils';

export enum FixedExpenseCurrency {
  CNY = 'CNY',
  USD = 'USD',
  HKD = 'HKD',
  JPY = 'JPY',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum FixedExpenseCycle {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum FixedExpenseStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum FixedExpenseType {
  SUBSCRIPTION = 'subscription',
  UTILITY = 'utility',
  HOUSING = 'housing',
  TRANSPORT = 'transport',
  FAMILY = 'family',
  WORK = 'work',
  OTHER = 'other',
}

export enum FixedExpensePriority {
  MUST = 'must',
  NORMAL = 'normal',
  OPTIONAL = 'optional',
}

export interface FixedExpenseEntity {
  id: string;
  name: string;
  amount: string;
  currency: FixedExpenseCurrency;
  cycle: FixedExpenseCycle;
  customCycleDays?: number;
  billingDay?: number;
  nextBillingDate?: string;
  startDate?: string;
  endDate?: string;
  status: FixedExpenseStatus;
  type: FixedExpenseType;
  provider?: string;
  account?: string;
  paymentMethod?: string;
  autoRenew: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  priority: FixedExpensePriority;
  includeInStatistics: boolean;
  sort: number;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FixedExpenseSummary {
  monthlyTotal: string;
  yearlyTotal: string;
  activeMonthlyTotal: string;
  nextBillingItems: FixedExpenseEntity[];
}

export interface GetFixedExpenseListResponseData {
  list: FixedExpenseEntity[];
  summary: FixedExpenseSummary;
}

export interface GetFixedExpenseQuery {
  status?: FixedExpenseStatus;
  type?: FixedExpenseType;
  cycle?: FixedExpenseCycle;
  includeInStatistics?: boolean;
  keyword?: string;
}

export function getFixedExpenseApi(params?: GetFixedExpenseQuery) {
  return request.get<unknown, SuccessResponse<GetFixedExpenseListResponseData>>('/fixed-expense', {
    params,
  });
}

export interface GetFixedExpenseByIdApiParams {
  id: string;
}

export function getFixedExpenseByIdApi(params: GetFixedExpenseByIdApiParams) {
  return request.get<unknown, SuccessResponse<FixedExpenseEntity>>(`/fixed-expense/${params.id}`);
}

export interface CreateFixedExpenseApiData {
  name: string;
  amount: string;
  currency?: FixedExpenseCurrency;
  cycle?: FixedExpenseCycle;
  customCycleDays?: number;
  billingDay?: number;
  nextBillingDate?: string;
  startDate?: string;
  endDate?: string;
  status?: FixedExpenseStatus;
  type?: FixedExpenseType;
  provider?: string;
  account?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
  priority?: FixedExpensePriority;
  includeInStatistics?: boolean;
  sort?: number;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export function postFixedExpenseApi(data: CreateFixedExpenseApiData) {
  return request.post<unknown, SuccessResponse<unknown>>('/fixed-expense', data);
}

export type UpdateFixedExpenseApiData = Partial<CreateFixedExpenseApiData>;

export function patchFixedExpenseApi(id: string, data: UpdateFixedExpenseApiData) {
  return request.patch<unknown, SuccessResponse<unknown>>(`/fixed-expense/${id}`, data);
}

export function deleteFixedExpenseApi(id: string) {
  return request.delete<unknown, SuccessResponse<unknown>>(`/fixed-expense/${id}`);
}
