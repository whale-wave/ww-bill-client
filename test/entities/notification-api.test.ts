import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  archiveNotificationApi,
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '@/entities/notification/api';
import {
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification/types';

const { deleteRequest, get, patch, post } = vi.hoisted(() => ({
  deleteRequest: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  request: { delete: deleteRequest, get, patch, post },
}));

describe('notification api', () => {
  beforeEach(() => {
    deleteRequest.mockReset();
    get.mockReset();
    patch.mockReset();
    post.mockReset();
  });

  it('requests a cursor page with its active filters', () => {
    const params = {
      cursor: 'opaque-cursor',
      limit: 20,
      status: UserNotificationStatus.UNREAD,
      type: UserNotificationType.LEDGER_JOIN_REQUEST,
    };

    getNotificationsApi(params);

    expect(get).toHaveBeenCalledWith('/notifications', { params });
  });

  it('marks one notification read with optimistic versioning', () => {
    markNotificationReadApi('notification/a b', 3);

    expect(patch).toHaveBeenCalledWith(
      '/notifications/notification%2Fa%20b/read',
      { version: 3 },
    );
  });

  it('marks all notifications read through the bulk endpoint', () => {
    markAllNotificationsReadApi();

    expect(post).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('soft-archives one notification using a query version', () => {
    archiveNotificationApi('notification/a b', 4);

    expect(deleteRequest).toHaveBeenCalledWith(
      '/notifications/notification%2Fa%20b',
      { params: { version: 4 } },
    );
  });
});
