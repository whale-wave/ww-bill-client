import type { QueryClient } from '@tanstack/react-query';
import { budgetKeys } from '@/entities/budget';
import { householdKeys } from '@/entities/household';

export async function invalidatePersonalRecordEditorCaches(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() }),
    queryClient.invalidateQueries({ queryKey: householdKeys.recordRoot() }),
    queryClient.invalidateQueries({ queryKey: householdKeys.calendarRoot() }),
    queryClient.invalidateQueries({ queryKey: householdKeys.chartRoot() }),
    queryClient.invalidateQueries({ queryKey: householdKeys.budgetRoot() }),
  ]);
}

export function invalidateLedgerRecordEditorCaches(
  queryClient: QueryClient,
  ledgerId: string,
) {
  return queryClient.invalidateQueries({ queryKey: budgetKeys.ledgerRoot(ledgerId) });
}
