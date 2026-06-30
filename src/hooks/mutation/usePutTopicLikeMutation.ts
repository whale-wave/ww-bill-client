import { useMutation, useQueryClient } from '@tanstack/react-query';
import { topicLike } from '@/api';
import { topicKeys } from '@/hooks/query';

export function usePutTopicLikeMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: topicLike,
    onSuccess: async (_data, topicId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(`${topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.userInfos() }),
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
