import { useMutation } from '@tanstack/react-query';
import { postCheckInApi } from '@/api';
import { queryClient } from '@/main';
import { useGetUserUserInfoQueryQueryKey } from '@/hooks';

export function usePostCheckInMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: () => postCheckInApi(),
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
