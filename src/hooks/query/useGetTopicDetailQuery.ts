import type { UseQueryOptions } from '@tanstack/react-query';
import type { TopicDetail } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTopicDetail } from '@/api';
import { topicKeys } from '@/hooks/query/keys/topicKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetTopicDetailQuery(options: {
  params: {
    id: string;
  };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<TopicDetail>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<TopicDetail>>({
    queryFn: () => getTopicDetail(options.params.id),
    queryKey: topicKeys.detail(options.params.id),
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
