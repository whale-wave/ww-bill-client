import type { GetChartApiParams } from '@/api';

export const chartKeys = {
  all: ['chart'] as const,
  lists: () => [...chartKeys.all, 'list'] as const,
  list: (params: GetChartApiParams) => [...chartKeys.lists(), params] as const,
};
