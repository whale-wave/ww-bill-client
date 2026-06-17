export const topicKeys = {
  all: ['topic'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (recommend?: boolean) => [...topicKeys.lists(), { recommend }] as const,
  comments: () => [...topicKeys.all, 'comment'] as const,
  comment: (id: string) => [...topicKeys.comments(), id] as const,
};
