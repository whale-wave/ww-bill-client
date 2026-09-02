import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserInfo } from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { getUserUserInfoApi, postCheckInApi, putUserUserInfoApi } from './api';
import { userKeys } from './keys';

interface CheckInMutationContext {
  previousUserInfo?: SuccessResponse<UserInfo>;
}

function incrementCheckInCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value + 1 : 1;
}

export function useGetUserUserInfoQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<UserInfo>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<UserInfo>>({
    queryFn: () => getUserUserInfoApi(),
    queryKey: userKeys.info(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function usePutUserUserInfoMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: putUserUserInfoApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.info() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePostCheckInMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: () => postCheckInApi(),
    onMutate: async (): Promise<CheckInMutationContext> => {
      await queryClient.cancelQueries({ queryKey: userKeys.info() });
      const previousUserInfo = queryClient.getQueryData<SuccessResponse<UserInfo>>(userKeys.info());

      queryClient.setQueryData<SuccessResponse<UserInfo>>(userKeys.info(), (currentUserInfo) => {
        if (!isSuccessApi(currentUserInfo))
          return currentUserInfo;

        return {
          ...currentUserInfo,
          data: {
            ...currentUserInfo.data,
            checkIn: true,
            checkInAll: incrementCheckInCount(currentUserInfo.data.checkInAll),
            checkInKeep: incrementCheckInCount(currentUserInfo.data.checkInKeep),
          },
        };
      });

      return { previousUserInfo };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousUserInfo)
        queryClient.setQueryData(userKeys.info(), context.previousUserInfo);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.info() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
