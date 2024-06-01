import { useMutation } from '@tanstack/react-query';
import { postFollowApi } from '@/api';
import { queryClient } from '@/main';
import { useGetFollowQueryQueryKey } from '@/hooks/useGetFollowQuery';

export const usePostFollowMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFollowApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetFollowQueryQueryKey],
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
