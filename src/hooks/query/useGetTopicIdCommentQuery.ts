import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetTopicIdCommentApiResponseData } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTopicIdCommentApi } from '@/api';
import { topicKeys } from '@/hooks/query/keys/topicKeys';
import { isSuccessApi } from '@/shared/api';

const emptyCommentInfo: GetTopicIdCommentApiResponseData = {
  data: [],
  total: 0,
};

export function useGetTopicIdCommentQuery(options: {
  params: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetTopicIdCommentApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetTopicIdCommentApiResponseData>>({
    queryFn: () => getTopicIdCommentApi(options.params),
    queryKey: topicKeys.comment(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyCommentInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
