import type { AppLockLockState } from './types';

export const APP_LOCK_MAX_ATTEMPTS = 5;
export const APP_LOCK_LOCK_DURATION_MS = 30_000;

export function isAppLockTemporarilyLocked(
  state: AppLockLockState,
  now = Date.now(),
) {
  return state.lockedUntil !== null && state.lockedUntil > now;
}

export function recordAppLockFailure(
  state: AppLockLockState,
  now = Date.now(),
): AppLockLockState {
  const previousAttempts
    = state.lockedUntil !== null && state.lockedUntil <= now
      ? 0
      : state.failedAttempts;
  const failedAttempts = previousAttempts + 1;
  return failedAttempts >= APP_LOCK_MAX_ATTEMPTS
    ? { failedAttempts, lockedUntil: now + APP_LOCK_LOCK_DURATION_MS }
    : { failedAttempts, lockedUntil: null };
}
