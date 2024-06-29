import { useMutation } from '@tanstack/react-query';
import { postUserEmailChangeEmailApi } from '@/api';
import { queryClient } from '@/main';
import { useGetUserUserInfoQueryQueryKey } from '@/hooks/query/useGetUserUserInfoQuery';

export function usePostUserEmailChangeEmailMutation() {
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
}
