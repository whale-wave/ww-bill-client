import type { GetFollowApiParams } from './api';

export const followKeys = {
  all: ['follow'] as const,
  lists: () => [...followKeys.all, 'list'] as const,
  list: (id: string, params: GetFollowApiParams) => [...followKeys.lists(), id, params] as const,
};
