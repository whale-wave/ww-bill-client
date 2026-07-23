import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import type {
  LedgerQuickSwitchPreference,
  PatchLedgerQuickSwitchApiData,
  UserAppConfig,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { userKeys } from '@/entities/user';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  getUserAppConfigApi,
  patchLedgerQuickSwitchApi,
  patchUserAppConfigApi,
} from './api';

export async function patchLedgerQuickSwitchMutationFn(
  data: PatchLedgerQuickSwitchApiData,
) {
  return assertSuccessApi(await patchLedgerQuickSwitchApi(data));
}

export function cacheLedgerQuickSwitchResponse(
  queryClient: QueryClient,
  response: SuccessResponse<LedgerQuickSwitchPreference>,
) {
  queryClient.setQueryData<SuccessResponse<UserAppConfig> | undefined>(
    userKeys.appConfig(),
    current => current
      ? {
          ...current,
          data: {
            ...current.data,
            isLedgerQuickSwitchEnabled: response.data.enabled,
            ledgerQuickSwitchVersion: response.data.version,
          },
        }
      : current,
  );
}

export function useGetUserAppConfigQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<UserAppConfig>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<UserAppConfig>>({
    queryFn: () => getUserAppConfigApi(),
    queryKey: userKeys.appConfig(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function usePatchUserAppConfigMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: patchUserAppConfigApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.appConfig() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePatchLedgerQuickSwitchMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: patchLedgerQuickSwitchMutationFn,
    onSuccess: (response) => {
      cacheLedgerQuickSwitchResponse(queryClient, response);
    },
    onError: async (error) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: userKeys.appConfig() });
    },
  });

  return [mutateAsync, rest] as const;
}
