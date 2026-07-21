import type { GetBudgetInfoApiParams, GetLedgerBudgetInfoApiParams } from './api';

export const budgetKeys = {
  all: ['budget'] as const,
  infoRoot: () => [...budgetKeys.all, 'info'] as const,
  info: (params: GetBudgetInfoApiParams) => [...budgetKeys.infoRoot(), params] as const,
  ledgerRoot: (ledgerId: string) => [...budgetKeys.all, 'ledger', ledgerId] as const,
  ledgerInfoRoot: (ledgerId: string) => [...budgetKeys.ledgerRoot(ledgerId), 'info'] as const,
  ledgerInfo: (ledgerId: string, params: GetLedgerBudgetInfoApiParams) => [
    ...budgetKeys.ledgerInfoRoot(ledgerId),
    params,
  ] as const,
};
