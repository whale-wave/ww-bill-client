import { useMutation } from '@tanstack/react-query';
import { putUserUserInfoApi } from '@/api';
import { queryClient } from '@/main';
import { useGetUserUserInfoQueryQueryKey } from '@/hooks/useGetUserUserInfoQuery';

export const usePutUserUserInfoMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: putUserUserInfoApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetUserUserInfoQueryQueryKey],
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
