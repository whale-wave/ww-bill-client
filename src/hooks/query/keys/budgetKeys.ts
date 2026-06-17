import type { GetBudgetInfoApiParams } from '@/api';

export const budgetKeys = {
  all: ['budget'] as const,
  infoRoot: () => [...budgetKeys.all, 'info'] as const,
  info: (params: GetBudgetInfoApiParams) => [...budgetKeys.infoRoot(), params] as const,
};
