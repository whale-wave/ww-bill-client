import type { GetRecordApiParams, GetRecordBillApiParams } from './api';

export const recordKeys = {
  all: ['record'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (params?: GetRecordApiParams) => [...recordKeys.lists(), params] as const,
  details: () => [...recordKeys.all, 'detail'] as const,
  detail: (params: { id: string }) => [...recordKeys.details(), params.id] as const,
  bills: () => [...recordKeys.all, 'bill'] as const,
  bill: (params: GetRecordBillApiParams) => [...recordKeys.bills(), params] as const,
};
