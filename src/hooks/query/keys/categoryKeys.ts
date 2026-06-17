import type { GetCategoryApiParams } from '@/api';

export const categoryKeys = {
  all: ['category'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: GetCategoryApiParams) => [...categoryKeys.lists(), params] as const,
};
