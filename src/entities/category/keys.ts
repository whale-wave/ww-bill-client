import type { GetCategoryApiParams } from './api';

export const categoryKeys = {
  all: ['category'] as const,
  catalog: () => [...categoryKeys.all, 'icon-catalog'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: GetCategoryApiParams) => [...categoryKeys.lists(), params] as const,
  ledgerRoot: (ledgerId: string) => [...categoryKeys.all, 'ledger', ledgerId] as const,
  ledgerListRoot: (ledgerId: string) => [...categoryKeys.ledgerRoot(ledgerId), 'list'] as const,
  ledgerList: (ledgerId: string, params?: Partial<GetCategoryApiParams>) => [
    ...categoryKeys.ledgerListRoot(ledgerId),
    params,
  ] as const,
};
