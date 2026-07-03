export const topicKeys = {
  all: ['topic'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (recommend?: boolean) => [...topicKeys.lists(), { recommend }] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
  comments: () => [...topicKeys.all, 'comment'] as const,
  comment: (id: string) => [...topicKeys.comments(), id] as const,
  userInfos: () => [...topicKeys.all, 'user-info'] as const,
  userInfo: (id: string) => [...topicKeys.userInfos(), id] as const,
};
