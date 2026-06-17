import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFollowApi } from '@/api';
import { followKeys, userKeys } from '@/hooks/query';

export function useDeleteFollowMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFollowApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.lists() }),
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
