import type { UseQueryOptions } from '@tanstack/react-query';
import type { Topic } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTopics } from '@/api';
import { topicKeys } from '@/hooks/query/keys/topicKeys';
import { isSuccessApi } from '@/utils';

interface GetTopicQueryData {
  topics: Topic[];
  total: number;
}

const emptyTopicInfo: GetTopicQueryData = {
  topics: [],
  total: 0,
};

export function useGetTopicQuery(options: {
  params?: {
    recommend?: boolean;
  };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetTopicQueryData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
} = {}) {
  const recommend = options.params?.recommend;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetTopicQueryData>>({
    queryFn: () => getTopics(recommend),
    queryKey: topicKeys.list(recommend),
    ...options.queryOptions,
    ...options.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyTopicInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
