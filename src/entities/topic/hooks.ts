import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  AddCommentBody,
  GetTopicIdCommentApiResponseData,
  Topic,
  TopicDetail,
  TopicUserInfoData,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import {
  addComment,
  addTopic,
  getTopicDetail,
  getTopicIdCommentApi,
  getTopics,
  topicLike,
  topicUserInfoApi,
} from './api';
import { topicKeys } from './keys';

interface GetTopicQueryData {
  topics: Topic[];
  total: number;
}

const emptyTopicInfo: GetTopicQueryData = {
  topics: [],
  total: 0,
};

const emptyCommentInfo: GetTopicIdCommentApiResponseData = {
  data: [],
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

interface PostTopicCommentVariables {
  topicId: number;
  body: AddCommentBody;
}

export function usePostTopicCommentMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ body, topicId }: PostTopicCommentVariables) => {
      return addComment(topicId, body);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(`${variables.topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.comment(`${variables.topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
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

export function usePostTopicMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: addTopic,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
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

export function usePutTopicLikeMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: topicLike,
    onSuccess: async (_data, topicId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(`${topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
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
