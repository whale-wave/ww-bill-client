import type {
  MarkAllNotificationsReadResult,
  UserNotification,
  UserNotificationList,
  UserNotificationStatus,
  UserNotificationType,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface GetNotificationsApiParams {
  status?: UserNotificationStatus;
  type?: UserNotificationType;
  limit?: number;
  cursor?: string;
}

export type NotificationListFilters = Omit<GetNotificationsApiParams, 'cursor'>;

export function getNotificationsApi(params?: GetNotificationsApiParams) {
  return request.get<unknown, SuccessResponse<UserNotificationList>>(
    '/notifications',
    { params },
  );
}

export function markNotificationReadApi(id: string, version: number) {
  return request.patch<unknown, SuccessResponse<UserNotification>>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { version },
  );
}

export function markAllNotificationsReadApi() {
  return request.post<unknown, SuccessResponse<MarkAllNotificationsReadResult>>(
    '/notifications/read-all',
  );
}

export function archiveNotificationApi(id: string, version: number) {
  return request.delete<unknown, SuccessResponse<UserNotification>>(
    `/notifications/${encodeURIComponent(id)}`,
    { params: { version } },
  );
}
