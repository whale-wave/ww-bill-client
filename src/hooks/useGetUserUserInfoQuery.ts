import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserUserInfoApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetUserUserInfoQueryQueryKey = 'useGetUserUserInfoQuery';

export function useGetUserUserInfoQuery(options?: {
  // params?: GetUserUserInfoApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getUserUserInfoApi(),
    queryKey: [useGetUserUserInfoQueryQueryKey] as const,
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
