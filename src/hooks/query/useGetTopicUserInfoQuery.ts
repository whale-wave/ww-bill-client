import type { UseQueryOptions } from '@tanstack/react-query';
import type { TopicUserInfoData } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { topicUserInfoApi } from '@/api';
import { topicKeys } from '@/hooks/query/keys/topicKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetTopicUserInfoQuery(options: {
  params: {
    id: string;
  };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<TopicUserInfoData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<TopicUserInfoData>>({
    queryFn: () => topicUserInfoApi(options.params.id),
    queryKey: topicKeys.userInfo(options.params.id),
    ...options.queryOptions,
    ...options.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return undefined;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
