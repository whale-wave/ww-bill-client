import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postFollowApi } from '@/api';
import { topicKeys } from '@/entities/topic';
import { followKeys, userKeys } from '@/hooks/query';

export function usePostFollowMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFollowApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
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
