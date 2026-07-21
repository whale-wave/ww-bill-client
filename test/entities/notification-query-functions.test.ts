import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveNotificationMutationFn,
  flattenNotificationPages,
  getNotificationsQueryFn,
  invalidateNotificationListsOnConflict,
  markAllNotificationsReadMutationFn,
  markNotificationReadMutationFn,
} from '@/entities/notification/hooks';
import { notificationKeys } from '@/entities/notification/keys';
import {
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification/types';

const api = vi.hoisted(() => ({
  archiveNotificationApi: vi.fn(),
  getNotificationsApi: vi.fn(),
  markAllNotificationsReadApi: vi.fn(),
  markNotificationReadApi: vi.fn(),
}));

vi.mock('@/entities/notification/api', () => api);

const firstNotification = {
  content: '请处理加入申请',
  createdAt: '2026-07-21T08:00:00.000Z',
  id: 'notification-1',
  payload: { action: 'review' },
  status: UserNotificationStatus.UNREAD,
  title: '申请待处理',
  type: UserNotificationType.LEDGER_JOIN_REQUEST,
  updatedAt: '2026-07-21T08:00:00.000Z',
  version: 1,
};

const failedEnvelope = {
  data: null,
  message: '操作失败',
  statusCode: 409,
};

describe('notification React Query functions', () => {
  beforeEach(() => {
    Object.values(api).forEach(mock => mock.mockReset());
  });

  it.each([
    ['list', () => {
      api.getNotificationsApi.mockResolvedValue(failedEnvelope);
      return getNotificationsQueryFn({ limit: 20 });
    }],
    ['mark read', () => {
      api.markNotificationReadApi.mockResolvedValue(failedEnvelope);
      return markNotificationReadMutationFn({ id: 'notification-1', version: 1 });
    }],
    ['mark all read', () => {
      api.markAllNotificationsReadApi.mockResolvedValue(failedEnvelope);
      return markAllNotificationsReadMutationFn();
    }],
    ['archive', () => {
      api.archiveNotificationApi.mockResolvedValue(failedEnvelope);
      return archiveNotificationMutationFn({ id: 'notification-1', version: 1 });
    }],
  ])('rejects a failed business envelope for %s', async (_name, execute) => {
    await expect(execute()).rejects.toMatchObject(failedEnvelope);
  });

  it('passes the cursor from the infinite query into the API call', async () => {
    const response = {
      data: { data: [firstNotification], nextCursor: 'next-cursor' },
      message: '成功',
      statusCode: 200,
    };
    api.getNotificationsApi.mockResolvedValue(response);

    await expect(getNotificationsQueryFn({
      cursor: 'current-cursor',
      limit: 20,
      status: UserNotificationStatus.UNREAD,
    })).resolves.toBe(response);
    expect(api.getNotificationsApi).toHaveBeenCalledWith({
      cursor: 'current-cursor',
      limit: 20,
      status: UserNotificationStatus.UNREAD,
    });
  });

  it('stably merges cursor pages and drops repeated boundary rows', () => {
    const secondNotification = {
      ...firstNotification,
      id: 'notification-2',
      title: '第二条通知',
    };
    const pages = [
      { data: { data: [firstNotification, secondNotification] } },
      { data: { data: [secondNotification] } },
    ];

    expect(flattenNotificationPages(pages)).toEqual([
      firstNotification,
      secondNotification,
    ]);
  });

  it('invalidates every filtered notification list after a 409 conflict', async () => {
    const queryClient = new QueryClient();
    const unreadKey = notificationKeys.list({
      status: UserNotificationStatus.UNREAD,
    });
    const readKey = notificationKeys.list({
      status: UserNotificationStatus.READ,
    });
    queryClient.setQueryData(unreadKey, { pages: [] });
    queryClient.setQueryData(readKey, { pages: [] });

    await invalidateNotificationListsOnConflict(queryClient, { statusCode: 409 });

    expect(queryClient.getQueryState(unreadKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(readKey)?.isInvalidated).toBe(true);
  });

  it('leaves notification caches alone for errors handled by global auth flow', async () => {
    const queryClient = new QueryClient();
    const unreadKey = notificationKeys.list({
      status: UserNotificationStatus.UNREAD,
    });
    queryClient.setQueryData(unreadKey, { pages: [] });

    await invalidateNotificationListsOnConflict(queryClient, { statusCode: 403 });

    expect(queryClient.getQueryState(unreadKey)?.isInvalidated).toBe(false);
  });
});
