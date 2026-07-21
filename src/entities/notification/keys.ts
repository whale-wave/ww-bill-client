import type { NotificationListFilters } from './api';

export const notificationKeys = {
  all: ['notification'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationListFilters = {}) => [
    ...notificationKeys.lists(),
    filters,
  ] as const,
};
