import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserInfo } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserUserInfoApi } from '@/api';
import { userKeys } from '@/hooks/query/keys/userKeys';
import { isSuccessApi } from '@/utils';

export function useGetUserUserInfoQuery(options?: {
  // params?: GetUserUserInfoApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<UserInfo>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<UserInfo>>({
    queryFn: () => getUserUserInfoApi(),
    queryKey: userKeys.info(),
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
