import type { QueryClient as QueryClientType } from '@tanstack/react-query';
import type { UserInfo } from '@/entities/user/api';
import type { SuccessResponse } from '@/shared/api';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostCheckInMutation } from '@/entities/user';
import { userKeys } from '@/entities/user/keys';

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

interface CheckInMutationContext {
  previousUserInfo?: SuccessResponse<UserInfo>;
}

interface CheckInMutationCallbacks {
  onError?: (error: unknown, variables: void, context: CheckInMutationContext | undefined) => Promise<unknown> | unknown;
  onMutate?: () => Promise<CheckInMutationContext> | CheckInMutationContext;
  onSettled?: () => Promise<unknown> | unknown;
}

function latestMutation() {
  return reactQueryMocks.mutationOptions.at(-1) as CheckInMutationCallbacks;
}

function createUserInfoResponse(): SuccessResponse<UserInfo> {
  return {
    data: {
      avatar: '',
      billRecord: { expend: 0, income: 0, month: 0, surplus: 0 },
      checkIn: false,
      checkInAll: 8,
      checkInKeep: 3,
      email: 'test@example.com',
      id: 1,
      name: 'Tester',
      recordCount: 12,
      userId: 'user-1',
      username: 'tester',
    },
    message: 'ok',
    statusCode: 200,
  };
}

describe('check-in mutation cache reconciliation', () => {
  beforeEach(() => {
    reactQueryMocks.mutationOptions.length = 0;
    reactQueryMocks.queryClient = new QueryClient();
  });

  it('updates the check-in status and counts immediately, then refreshes the user info', async () => {
    const queryClient = reactQueryMocks.queryClient;
    queryClient.setQueryData(userKeys.info(), createUserInfoResponse());

    usePostCheckInMutation();
    const context = await latestMutation().onMutate?.();
    const optimisticResponse = queryClient.getQueryData<SuccessResponse<UserInfo>>(userKeys.info());

    expect(optimisticResponse?.data).toMatchObject({
      checkIn: true,
      checkInAll: 9,
      checkInKeep: 4,
    });
    expect(context?.previousUserInfo?.data.checkIn).toBe(false);

    await latestMutation().onSettled?.();
    expect(queryClient.getQueryState(userKeys.info())?.isInvalidated).toBe(true);
  });

  it('restores the previous user info when check-in fails', async () => {
    const queryClient = reactQueryMocks.queryClient;
    const originalResponse = createUserInfoResponse();
    queryClient.setQueryData(userKeys.info(), originalResponse);

    usePostCheckInMutation();
    const context = await latestMutation().onMutate?.();
    await latestMutation().onError?.(new Error('failed'), undefined, context);

    expect(queryClient.getQueryData(userKeys.info())).toEqual(originalResponse);
  });
});
