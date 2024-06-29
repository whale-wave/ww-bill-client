import { useMutation } from '@tanstack/react-query';
import { deleteFollowApi } from '@/api';
import { queryClient } from '@/main';
import { useGetFollowQueryQueryKey } from '@/hooks/query/useGetFollowQuery';

export function useDeleteFollowMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFollowApi,
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
}
