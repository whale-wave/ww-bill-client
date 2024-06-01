import { useQuery } from '@tanstack/react-query';
import { getTopicIdCommentApi } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetTopicIdCommentQueryQueryKey = 'useGetTopicIdCommentQuery';

export const useGetTopicIdCommentQuery = (options: {
  params: string;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getTopicIdCommentApi(queryKey[1]),
    queryKey: [useGetTopicIdCommentQueryQueryKey, options.params] as const,
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
