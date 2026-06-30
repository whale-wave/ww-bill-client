import type { AddCommentBody } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment } from '@/api';
import { topicKeys } from '@/hooks/query';

interface PostTopicCommentVariables {
  topicId: number;
  body: AddCommentBody;
}

export function usePostTopicCommentMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ body, topicId }: PostTopicCommentVariables) => {
      return addComment(topicId, body);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(`${variables.topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.comment(`${variables.topicId}`) }),
        queryClient.invalidateQueries({ queryKey: topicKeys.lists() }),
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
