import type { UseQueryOptions } from '@tanstack/react-query';
import type { FollowData, GetFollowApiParams } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFollowApi } from '@/api';
import { followKeys } from '@/hooks/query/keys/followKeys';
import { isSuccessApi } from '@/utils';

export function useGetFollowQuery(options?: {
  params: {
    id: string;
    params: GetFollowApiParams;
  };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<FollowData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<FollowData>>({
    queryFn: () => getFollowApi(options!.params.id, options!.params.params),
    queryKey: followKeys.list(options!.params.id, options!.params.params),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return { data: [], count: 0 };
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
