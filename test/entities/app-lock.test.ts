import { afterEach, describe, expect, it } from 'vitest';
import {
  APP_LOCK_MAX_ATTEMPTS,
  APP_LOCK_MIN_POINTS,
  createAppLockCredential,
  isAppLockTemporarilyLocked,
  isTooSimplePattern,
  localAppLockStorage,
  normalizePattern,
  recordAppLockFailure,
  verifyAppLockPattern,
} from '@/entities/app-lock';

describe('app lock credential and storage', () => {
  afterEach(() => localStorage.clear());

  it('normalizes duplicate points and enforces the minimum pattern length', () => {
    expect(normalizePattern([1, 1, 2, 10, 3])).toEqual([1, 2, 3]);
    expect(isTooSimplePattern([1, 2, 3])).toBe(true);
    expect(isTooSimplePattern([1, 4, 5, 8])).toBe(false);
    expect(APP_LOCK_MIN_POINTS).toBe(4);
  });

  it('creates a salted PBKDF2 credential and verifies only the matching pattern', async () => {
    const credential = await createAppLockCredential([1, 4, 5, 8]);
    expect(credential.algorithm).toBe('PBKDF2-SHA256');
    expect(credential.iterations).toBeGreaterThan(100_000);
    expect(credential.salt).not.toBe('');
    expect(await verifyAppLockPattern([1, 4, 5, 8], credential)).toBe(true);
    expect(await verifyAppLockPattern([1, 4, 5, 9], credential)).toBe(false);
  });

  it('names credentials and lock state per user', () => {
    localAppLockStorage.saveLockState('a', {
      failedAttempts: 2,
      lockedUntil: 123,
    });
    localAppLockStorage.saveLockState('b', {
      failedAttempts: 0,
      lockedUntil: null,
    });
    expect(localAppLockStorage.getLockState('a')).toEqual({
      failedAttempts: 2,
      lockedUntil: 123,
    });
    expect(localAppLockStorage.getLockState('b')).toEqual({
      failedAttempts: 0,
      lockedUntil: null,
    });
    expect(localStorage.getItem('app-lock:a:lock-state')).not.toBeNull();
    expect(localStorage.getItem('app-lock:b:lock-state')).not.toBeNull();
  });

  it('persists a temporary lock after the fifth failed attempt', () => {
    let state = { failedAttempts: 0, lockedUntil: null as number | null };
    for (let attempt = 0; attempt < APP_LOCK_MAX_ATTEMPTS; attempt++)
      state = recordAppLockFailure(state, 1_000);
    expect(state.failedAttempts).toBe(5);
    expect(isAppLockTemporarilyLocked(state, 1_001)).toBe(true);
    expect(isAppLockTemporarilyLocked(state, state.lockedUntil! + 1)).toBe(
      false,
    );
  });
});
