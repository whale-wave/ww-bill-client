export enum UserNotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum UserNotificationType {
  HOUSEHOLD_STATUS_CHANGED = 'HOUSEHOLD_STATUS_CHANGED',
  LEDGER_JOIN_REQUEST = 'LEDGER_JOIN_REQUEST',
  LEDGER_JOIN_APPROVED = 'LEDGER_JOIN_APPROVED',
  LEDGER_JOIN_REJECTED = 'LEDGER_JOIN_REJECTED',
  LEDGER_MEMBER_CHANGED = 'LEDGER_MEMBER_CHANGED',
  LEDGER_STATUS_CHANGED = 'LEDGER_STATUS_CHANGED',
}

export interface UserNotificationPayload extends Record<string, unknown> {
  action?: unknown;
  householdId?: unknown;
  ledgerId?: unknown;
  joinRequestId?: unknown;
  memberId?: unknown;
  status?: unknown;
  assignedRole?: unknown;
  role?: unknown;
  version?: unknown;
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
