import type { QueryClient as QueryClientType } from '@tanstack/react-query';
import type { SuccessResponse } from '@/shared/api';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useCreateHouseholdInvitationMutation,
  useCreateHouseholdMutation,
  useRevokeHouseholdInvitationMutation,
} from '@/entities/household/hooks';
import { householdKeys } from '@/entities/household/keys';
import { HouseholdInvitationStatus } from '@/entities/household/types';

const reactQueryMocks = vi.hoisted(() => ({
  mutationOptions: [] as Array<{
    onSuccess?: (response: unknown, variables: never) => Promise<unknown> | unknown;
  }>,
  queryClient: undefined as unknown as QueryClientType,
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...original,
    useMutation: (options: unknown) => {
      reactQueryMocks.mutationOptions.push(options as never);
      return { mutateAsync: vi.fn() };
    },
    useQueryClient: () => reactQueryMocks.queryClient,
  };
});

function latestMutation() {
  return reactQueryMocks.mutationOptions.at(-1);
}

function successResponse<T>(data: T): SuccessResponse<T> {
  return { data, message: 'ok', statusCode: 200 };
}

describe('household invitation persistence hooks', () => {
  beforeEach(() => {
    reactQueryMocks.mutationOptions.length = 0;
    reactQueryMocks.queryClient = new QueryClient();
    localStorage.clear();
  });

  it('persists the invitation returned by household creation', async () => {
    useCreateHouseholdMutation();

    await latestMutation()?.onSuccess?.(successResponse({
      household: {
        id: 'household/a',
        sharedStartMonth: '2026-07-01',
        status: 'PENDING_PARTNER',
        version: 1,
      },
      invitation: {
        id: 'invite/a',
        householdId: 'household/a',
        code: 'ABC123',
        status: HouseholdInvitationStatus.ACTIVE,
        expiresAt: '2099-01-01T00:00:00.000Z',
        version: 1,
      },
    }), undefined as never);

    expect(localStorage.getItem('wh:invitation:household/a')).toContain('ABC123');
  });

  it('persists a regenerated invitation and keeps the query cache in sync', async () => {
    const queryClient = reactQueryMocks.queryClient;
    useCreateHouseholdInvitationMutation();

    await latestMutation()?.onSuccess?.(successResponse({
      id: 'invite/b',
      householdId: 'household/a',
      code: 'XYZ987',
      status: HouseholdInvitationStatus.ACTIVE,
      expiresAt: '2099-01-01T00:00:00.000Z',
      version: 2,
    }), { householdId: 'household/a' } as never);

    expect(localStorage.getItem('wh:invitation:household/a')).toContain('XYZ987');
    expect(queryClient.getQueryData(householdKeys.invitation('household/a'))).toEqual({
      id: 'invite/b',
      householdId: 'household/a',
      code: 'XYZ987',
      status: HouseholdInvitationStatus.ACTIVE,
      expiresAt: '2099-01-01T00:00:00.000Z',
      version: 2,
    });
  });

  it('clears storage and query cache when an invitation is revoked', async () => {
    const queryClient = reactQueryMocks.queryClient;
    queryClient.setQueryData(householdKeys.invitation('household/a'), { id: 'invite/a' });
    localStorage.setItem('wh:invitation:household/a', JSON.stringify({
      version: 1,
      householdId: 'household/a',
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }));
    useRevokeHouseholdInvitationMutation();

    await latestMutation()?.onSuccess?.(successResponse({
      id: 'invite/a',
      status: HouseholdInvitationStatus.REVOKED,
    }), { householdId: 'household/a', invitationId: 'invite/a' } as never);

    expect(localStorage.getItem('wh:invitation:household/a')).toBeNull();
    expect(queryClient.getQueryData(householdKeys.invitation('household/a'))).toBeUndefined();
  });
});
