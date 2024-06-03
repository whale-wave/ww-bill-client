import { useQuery } from '@tanstack/react-query';
import { getUserUserInfoApi } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetUserUserInfoQueryQueryKey = 'useGetUserUserInfoQuery';

export const useGetUserUserInfoQuery = (options?: {
  // params?: GetUserUserInfoApiParams;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getUserUserInfoApi(),
    queryKey: [useGetUserUserInfoQueryQueryKey] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response)) return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
