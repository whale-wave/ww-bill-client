import type { UserNotificationPayload } from '@/entities/notification';
import { ROUTES_PATH } from '@/shared/config/routes';

function hasString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function getNotificationTarget(
  payload: UserNotificationPayload | null | undefined,
) {
  if (!payload || !hasString(payload.action))
    return undefined;

  if (payload.action === 'review'
    && hasString(payload.ledgerId)
    && hasString(payload.joinRequestId)) {
    return ROUTES_PATH.LEDGER_JOIN_REQUEST_DETAIL.getPath(
      payload.ledgerId,
      payload.joinRequestId,
    );
  }

  if (payload.action === 'open-ledger' && hasString(payload.ledgerId))
    return ROUTES_PATH.LEDGER_DETAIL.getPath(payload.ledgerId);

  if (payload.action === 'open-ledgers')
    return ROUTES_PATH.LEDGERS.getPath();

  if (payload.action === 'open-applications')
    return ROUTES_PATH.LEDGER_APPLICATIONS.getPath();

  if (payload.action === 'open-household' && hasString(payload.householdId))
    return ROUTES_PATH.HOUSEHOLD_HOME.getPath(payload.householdId);

  if (payload.action === 'open-household-entry')
    return ROUTES_PATH.HOUSEHOLD.getPath();

  return undefined;
}
