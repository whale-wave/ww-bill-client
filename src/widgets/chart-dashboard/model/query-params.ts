export type ChartDashboardScopeKind = 'personal' | 'ledger' | 'household';

export function resolveChartAccountFilter(scopeKind: ChartDashboardScopeKind, account?: string | null): string | undefined {
  if (scopeKind === 'ledger' || !account)
    return undefined;
  return account;
}
