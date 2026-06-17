import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserAppConfig } from '@/api/user-app-config';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserAppConfigApi } from '@/api';
import { userKeys } from '@/hooks/query/keys/userKeys';
import { isSuccessApi } from '@/utils';

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
