import { useQuery } from '@tanstack/react-query';
import { getFollowApi, GetFollowApiParams } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetFollowQueryQueryKey = 'useGetFollowQuery' as const;

export const useGetFollowQuery = (options?: {
  params: {
    id: string;
    params: GetFollowApiParams;
  };
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getFollowApi(queryKey[1], queryKey[2]),
    queryKey: [
      useGetFollowQueryQueryKey,
      options!.params.id,
      options!.params.params,
    ] as const,
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
