import { describe, expect, it } from 'vitest';
import { notificationKeys } from '@/entities/notification/keys';
import {
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification/types';

describe('notification query keys', () => {
  it('includes every list filter in the query key', () => {
    const filters = {
      limit: 25,
      status: UserNotificationStatus.UNREAD,
      type: UserNotificationType.LEDGER_JOIN_REQUEST,
    };

    expect(notificationKeys.list(filters)).toEqual([
      'notification',
      'list',
      filters,
    ]);
  });

  it('provides a list root for invalidating every filtered page', () => {
    expect(notificationKeys.lists()).toEqual(['notification', 'list']);
  });
});
