export enum UserNotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum UserNotificationType {
  ACHIEVEMENT_BACKFILLED = 'ACHIEVEMENT_BACKFILLED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  CLIENT_RELEASE = 'CLIENT_RELEASE',
  HOUSEHOLD_STATUS_CHANGED = 'HOUSEHOLD_STATUS_CHANGED',
  LEDGER_JOIN_REQUEST = 'LEDGER_JOIN_REQUEST',
  LEDGER_JOIN_APPROVED = 'LEDGER_JOIN_APPROVED',
  LEDGER_JOIN_REJECTED = 'LEDGER_JOIN_REJECTED',
  LEDGER_MEMBER_CHANGED = 'LEDGER_MEMBER_CHANGED',
  LEDGER_STATUS_CHANGED = 'LEDGER_STATUS_CHANGED',
}

export interface UserNotificationPayload extends Record<string, unknown> {
  achievementCodes?: unknown;
  action?: unknown;
  coverPicture?: unknown;
  householdId?: unknown;
  ledgerId?: unknown;
  joinRequestId?: unknown;
  images?: unknown;
  memberId?: unknown;
  status?: unknown;
  assignedRole?: unknown;
  role?: unknown;
  version?: unknown;
  platform?: unknown;
  versionName?: unknown;
  versionCode?: unknown;
  downloadUrl?: unknown;
  promptEnabled?: unknown;
  promptLevel?: unknown;
  notificationId?: unknown;
}

export interface UserNotification {
  id: string;
  ledgerId?: string;
  joinRequestId?: string;
  type: UserNotificationType;
  title: string;
  content: string;
  payload: UserNotificationPayload;
  status: UserNotificationStatus;
  readAt?: string;
  archivedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationList {
  data: UserNotification[];
  nextCursor?: string;
}

export interface MarkAllNotificationsReadResult {
  affected: number;
}
