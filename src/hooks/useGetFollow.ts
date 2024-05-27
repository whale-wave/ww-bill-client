import { useMutation, useQuery } from '@tanstack/react-query';
import {
  deleteFollowApi,
  getFollowApi,
  GetFollowApiParams,
  postFollowApi,
} from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';
import { queryClient } from '@/main';

export const UseGetFollowQueryQueryKey = 'useGetFollowQuery';

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
      UseGetFollowQueryQueryKey,
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

export const usePostFollowMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFollowApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [UseGetFollowQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
};

export const useDeleteFollowMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFollowApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [UseGetFollowQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
};
