import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { invalidateCategoryConsumers } from '@/entities/category';

function seed(queryClient: QueryClient, queryKey: readonly unknown[]) {
  queryClient.setQueryData(queryKey, { value: true });
}

describe('category consumer cache invalidation', () => {
  it('keeps household budget snapshots intact after metadata changes', async () => {
    const queryClient = new QueryClient();
    const category = ['category', 'ledger', 'ledger-1'];
    const record = ['record', 'ledger', 'ledger-1'];
    const householdRecord = ['household', 'record', 'household-1'];
    const householdBudget = ['household', 'budget', 'household-1'];
    for (const key of [category, record, householdRecord, householdBudget])
      seed(queryClient, key);

    await invalidateCategoryConsumers(queryClient, 'metadata');

    expect(queryClient.getQueryState(category)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(record)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdRecord)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdBudget)?.isInvalidated).toBe(false);
  });

  it('refreshes sorted household budget candidates without touching record lists', async () => {
    const queryClient = new QueryClient();
    const category = ['category', 'ledger', 'ledger-1'];
    const filterOptions = ['record', 'ledger', 'ledger-1', 'filter-options'];
    const recordList = ['record', 'ledger', 'ledger-1', 'list'];
    const householdBudget = ['household', 'budget', 'household-1'];
    for (const key of [category, filterOptions, recordList, householdBudget])
      seed(queryClient, key);

    await invalidateCategoryConsumers(queryClient, 'order');

    expect(queryClient.getQueryState(category)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(filterOptions)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdBudget)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordList)?.isInvalidated).toBe(false);
  });

  it('refreshes household budget candidates when category availability changes', async () => {
    const queryClient = new QueryClient();
    const householdBudget = ['household', 'budget', 'household-1'];
    seed(queryClient, householdBudget);

    await invalidateCategoryConsumers(queryClient, 'status');

    expect(queryClient.getQueryState(householdBudget)?.isInvalidated).toBe(true);
  });
});
