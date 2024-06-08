import { useMutation } from '@tanstack/react-query';
import { postUserEmailChangeEmailApi } from '@/api';
import { queryClient } from '@/main';
import { useGetUserUserInfoQueryQueryKey } from '@/hooks/useGetUserUserInfoQuery';

export const usePostUserEmailChangeEmailMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postUserEmailChangeEmailApi,
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
