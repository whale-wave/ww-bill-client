import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserAppConfig } from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { userKeys } from '@/entities/user';
import { isSuccessApi } from '@/shared/api';
import { getUserAppConfigApi, patchUserAppConfigApi } from './api';

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
