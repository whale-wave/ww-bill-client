import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTopic } from '@/api';
import { topicKeys } from '@/hooks/query';

export function usePostTopicMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: addTopic,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
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
