import type { QueryClient as QueryClientType } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { budgetKeys } from '@/entities/budget';
import { chartKeys } from '@/entities/chart';
import { householdKeys } from '@/entities/household';
import {
  useExecuteLedgerTransferMutation,
  useRestoreLedgerRecordMutation,
} from '@/entities/ledger-data/hooks';
import { ledgerDataKeys } from '@/entities/ledger-data/keys';
import { ledgerKeys } from '@/entities/ledger/keys';
import {
  useCreateLedgerRecordMutation,
  useDeleteLedgerRecordMutation,
  useDeleteRecordMutation,
  useUpdateLedgerRecordMutation,
} from '@/entities/record/hooks';
import { recordKeys } from '@/entities/record/keys';
import {
  invalidateLedgerRecordEditorCaches,
  invalidatePersonalRecordEditorCaches,
} from '@/features/record-editor';

const reactQueryMocks = vi.hoisted(() => ({
  mutationOptions: [] as unknown[],
  queryClient: undefined as unknown as QueryClientType,
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...original,
    useMutation: (options: unknown) => {
      reactQueryMocks.mutationOptions.push(options);
      return { mutateAsync: vi.fn() };
    },
    useQueryClient: () => reactQueryMocks.queryClient,
  };
});

interface MutationCallbacks<TVariables> {
  onError?: (error: unknown, variables: TVariables) => Promise<unknown> | unknown;
  onSuccess?: (response: unknown, variables: TVariables) => Promise<unknown> | unknown;
}

function latestMutation<TVariables>() {
  return reactQueryMocks.mutationOptions.at(-1) as MutationCallbacks<TVariables>;
}

function seedQuery(queryClient: QueryClient, queryKey: readonly unknown[]) {
  queryClient.setQueryData(queryKey, { data: [] });
}

describe('record-count mutation hook cache reconciliation', () => {
  beforeEach(() => {
    reactQueryMocks.mutationOptions.length = 0;
    reactQueryMocks.queryClient = new QueryClient();
  });

  it.each([
    ['custom create', useCreateLedgerRecordMutation],
    ['custom delete', useDeleteLedgerRecordMutation],
  ])('reuses count-changing success invalidations on 409 for %s', async (_name, useMutationHook) => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());
    seedQuery(queryClient, recordKeys.ledgerRoot('ledger-a'));
    seedQuery(queryClient, chartKeys.ledgerRoot('ledger-a'));

    useMutationHook();
    await latestMutation<{ ledgerId: string }>().onError?.(
      { statusCode: 409 },
      { ledgerId: 'ledger-a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(chartKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
  });

  it('invalidates custom budget data after a scoped record is created', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, budgetKeys.ledgerRoot('ledger-a'));

    await invalidateLedgerRecordEditorCaches(queryClient, 'ledger-a');

    expect(queryClient.getQueryState(budgetKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
  });

  it('invalidates personal budget and household aggregates after a personal record is created', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, budgetKeys.infoRoot());
    seedQuery(queryClient, householdKeys.recordRoot());
    seedQuery(queryClient, householdKeys.calendarRoot());
    seedQuery(queryClient, householdKeys.chartRoot());
    seedQuery(queryClient, householdKeys.budgetRoot());

    await invalidatePersonalRecordEditorCaches(queryClient);

    expect(queryClient.getQueryState(budgetKeys.infoRoot())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdKeys.recordRoot())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdKeys.calendarRoot())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdKeys.chartRoot())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(householdKeys.budgetRoot())?.isInvalidated).toBe(true);
  });

  it('does not add count invalidation to a custom update conflict', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());

    useUpdateLedgerRecordMutation();
    await latestMutation<{ ledgerId: string }>().onError?.(
      { statusCode: 409 },
      { ledgerId: 'ledger-a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(false);
  });

  it('invalidates navigation counts after a successful custom update', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());

    useUpdateLedgerRecordMutation();
    await latestMutation<{ ledgerId: string }>().onSuccess?.(
      { statusCode: 200 },
      { ledgerId: 'ledger-a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
  });

  it('reuses personal delete success invalidations on 409', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());
    seedQuery(queryClient, recordKeys.list());
    seedQuery(queryClient, recordKeys.detail({ id: 'record-a' }));
    seedQuery(queryClient, recordKeys.bill({ type: 'year', year: 2026 }));
    seedQuery(queryClient, chartKeys.all);

    useDeleteRecordMutation();
    await latestMutation<{ id: string; version: number }>().onError?.(
      { statusCode: 409 },
      { id: 'record-a', version: 3 },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.detail({ id: 'record-a' }))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(recordKeys.bill({ type: 'year', year: 2026 }))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(chartKeys.all)?.isInvalidated).toBe(true);
  });

  it('reuses restore success invalidations on 409', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());
    seedQuery(queryClient, ledgerDataKeys.recovery('ledger-a'));
    seedQuery(queryClient, recordKeys.list());
    seedQuery(queryClient, recordKeys.ledgerRoot('ledger-a'));

    useRestoreLedgerRecordMutation();
    await latestMutation<{ ledgerId: string }>().onError?.(
      { statusCode: 409 },
      { ledgerId: 'ledger-a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(ledgerDataKeys.recovery('ledger-a'))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(recordKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
  });

  it('reuses transfer source, target and navigation invalidations on 409', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedQuery(queryClient, ledgerKeys.navigation());
    seedQuery(queryClient, recordKeys.list());
    seedQuery(queryClient, recordKeys.ledgerRoot('ledger-a'));
    seedQuery(queryClient, recordKeys.ledgerRoot('ledger-b'));

    useExecuteLedgerTransferMutation();
    await latestMutation<{ sourceLedgerId: string; targetLedgerId: string }>().onError?.(
      { statusCode: 409 },
      { sourceLedgerId: 'ledger-a', targetLedgerId: 'ledger-b' },
    );

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot('ledger-b'))?.isInvalidated)
      .toBe(true);
  });
});
