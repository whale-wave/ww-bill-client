import type { GetChartApiParams } from './api';

export const chartKeys = {
  all: ['chart'] as const,
  lists: () => [...chartKeys.all, 'list'] as const,
  list: (params: GetChartApiParams) => [...chartKeys.lists(), params] as const,
  ledgerRoot: (ledgerId: string) => [...chartKeys.all, 'ledger', ledgerId] as const,
  ledgerLists: (ledgerId: string) => [...chartKeys.ledgerRoot(ledgerId), 'list'] as const,
  ledgerList: (ledgerId: string, params: GetChartApiParams) => [
    ...chartKeys.ledgerLists(ledgerId),
    params,
  ] as const,
  tagRanking: (params: unknown) => [...chartKeys.all, 'tag-ranking', params] as const,
  ledgerTagRanking: (ledgerId: string, params: unknown) => [...chartKeys.ledgerRoot(ledgerId), 'tag-ranking', params] as const,
};
