import type { UseQueryOptions } from '@tanstack/react-query';
import type { FollowData, GetFollowApiParams } from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { topicKeys } from '@/entities/topic';
import { userKeys } from '@/entities/user';
import { isSuccessApi } from '@/shared/api';
import { deleteFollowApi, getFollowApi, postFollowApi } from './api';
import { followKeys } from './keys';

export function useGetFollowQuery(options: {
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
    queryFn: () => getFollowApi(options.params.id, options.params.params),
    queryKey: followKeys.list(options.params.id, options.params.params),
    ...options.queryOptions,
    ...options.options,
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

export function useDeleteFollowMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFollowApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
        queryClient.invalidateQueries({ queryKey: userKeys.info() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePostFollowMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFollowApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
        queryClient.invalidateQueries({ queryKey: userKeys.info() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
