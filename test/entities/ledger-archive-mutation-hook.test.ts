import type { QueryClient as QueryClientType } from '@tanstack/react-query';
import type { SuccessResponse } from '@/shared/api';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useArchiveLedgerMutation } from '@/entities/ledger/hooks';
import { ledgerKeys } from '@/entities/ledger/keys';

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

interface ArchiveVariables {
  data: { confirmed: true; version: number };
  ledgerId: string;
}

interface ArchiveMutationCallbacks {
  onError?: (error: unknown, variables: ArchiveVariables) => Promise<unknown> | unknown;
  onSuccess?: (
    response: SuccessResponse<unknown>,
    variables: ArchiveVariables,
  ) => Promise<unknown> | unknown;
}

function latestMutation() {
  return reactQueryMocks.mutationOptions.at(-1) as ArchiveMutationCallbacks;
}

function seedMembers(queryClient: QueryClient, ledgerId: string) {
  queryClient.setQueryData(ledgerKeys.membersRoot(ledgerId), { data: [] });
}

describe('archive ledger mutation member-cache reconciliation', () => {
  beforeEach(() => {
    reactQueryMocks.mutationOptions.length = 0;
    reactQueryMocks.queryClient = new QueryClient();
  });

  it('invalidates the archived ledger member root after success', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedMembers(queryClient, 'ledger/a');
    useArchiveLedgerMutation();

    await latestMutation().onSuccess?.(
      { data: {}, message: 'ok', statusCode: 200 },
      { data: { confirmed: true, version: 3 }, ledgerId: 'ledger/a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.membersRoot('ledger/a'))?.isInvalidated)
      .toBe(true);
  });

  it('invalidates the archived ledger member root after a 409 conflict', async () => {
    const queryClient = reactQueryMocks.queryClient;
    seedMembers(queryClient, 'ledger/a');
    useArchiveLedgerMutation();

    await latestMutation().onError?.(
      { statusCode: 409 },
      { data: { confirmed: true, version: 3 }, ledgerId: 'ledger/a' },
    );

    expect(queryClient.getQueryState(ledgerKeys.membersRoot('ledger/a'))?.isInvalidated)
      .toBe(true);
  });
});
