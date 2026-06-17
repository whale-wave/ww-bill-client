import type { GetFixedExpenseQuery } from '@/api';

export const fixedExpenseKeys = {
  all: ['fixed-expense'] as const,
  lists: () => [...fixedExpenseKeys.all, 'list'] as const,
  list: (params?: GetFixedExpenseQuery) => [...fixedExpenseKeys.lists(), params] as const,
  details: () => [...fixedExpenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...fixedExpenseKeys.details(), id] as const,
};
