import type {
  QueryClient,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import type {
  GetNotificationsApiParams,
  NotificationListFilters,
} from './api';
import type {
  MarkAllNotificationsReadResult,
  UserNotification,
  UserNotificationList,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import {
  archiveNotificationApi,
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from './api';
import { notificationKeys } from './keys';

type NotificationListResponse = SuccessResponse<UserNotificationList>;

export async function getNotificationsQueryFn(params?: GetNotificationsApiParams) {
  return assertSuccessApi(await getNotificationsApi(params));
}

export async function markNotificationReadMutationFn(options: {
  id: string;
  version: number;
}) {
  return assertSuccessApi(
    await markNotificationReadApi(options.id, options.version),
  );
}

export async function markAllNotificationsReadMutationFn() {
  return assertSuccessApi(await markAllNotificationsReadApi());
}

export async function archiveNotificationMutationFn(options: {
  id: string;
  version: number;
}) {
  return assertSuccessApi(
    await archiveNotificationApi(options.id, options.version),
  );
}

export function flattenNotificationPages(
  pages: Array<Pick<NotificationListResponse, 'data'>> = [],
) {
  const seenIds = new Set<string>();
  const notifications: UserNotification[] = [];

  pages.forEach((page) => {
    page.data.data.forEach((notification) => {
      if (seenIds.has(notification.id))
        return;
      seenIds.add(notification.id);
      notifications.push(notification);
    });
  });

  return notifications;
}

interface UseNotificationsQueryOptions {
  params?: NotificationListFilters;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      NotificationListResponse,
      unknown,
      NotificationListResponse,
      NotificationListResponse,
      ReturnType<typeof notificationKeys.list>
    >,
    'getNextPageParam' | 'queryFn' | 'queryKey'
  >;
}

export function useNotificationsQuery(
  options: UseNotificationsQueryOptions = {},
) {
  const filters = options.params ?? {};
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: ({ pageParam }) => getNotificationsQueryFn({
      ...filters,
      ...(typeof pageParam === 'string' ? { cursor: pageParam } : {}),
    }),
    getNextPageParam: lastPage => lastPage.data.nextCursor,
    staleTime: 30_000,
    ...options.queryOptions,
  });

  return {
    ...query,
    response: query.data,
    data: flattenNotificationPages(query.data?.pages),
  };
}

function isConflictError(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && error.statusCode === 409;
}

export async function invalidateNotificationListsOnConflict(
  queryClient: QueryClient,
  error: unknown,
) {
  if (!isConflictError(error))
    return;
  await queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
}

function useNotificationInvalidation() {
  const queryClient = useQueryClient();
  return {
    queryClient,
    invalidateLists: () => queryClient.invalidateQueries({
      queryKey: notificationKeys.lists(),
    }),
  };
}

export function useMarkNotificationReadMutation() {
  const { invalidateLists, queryClient } = useNotificationInvalidation();
  const mutation = useMutation({
    mutationFn: markNotificationReadMutationFn,
    onSuccess: invalidateLists,
    onError: error => invalidateNotificationListsOnConflict(queryClient, error),
  });

  return mutation;
}

export function useMarkAllNotificationsReadMutation() {
  const { invalidateLists, queryClient } = useNotificationInvalidation();
  return useMutation<
    SuccessResponse<MarkAllNotificationsReadResult>,
    unknown,
    void
  >({
    mutationFn: markAllNotificationsReadMutationFn,
    onSuccess: invalidateLists,
    onError: error => invalidateNotificationListsOnConflict(queryClient, error),
  });
}

export function useArchiveNotificationMutation() {
  const { invalidateLists, queryClient } = useNotificationInvalidation();
  return useMutation({
    mutationFn: archiveNotificationMutationFn,
    onSuccess: invalidateLists,
    onError: error => invalidateNotificationListsOnConflict(queryClient, error),
  });
}
