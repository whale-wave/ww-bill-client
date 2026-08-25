import type { AppLockCredential, AppLockLockState } from '../model/types';

export interface AppLockStorage {
  getCredentialStatus: (
    userId: string | number,
  ) => 'missing' | 'valid' | 'corrupted';
  getCredential: (userId: string | number) => AppLockCredential | null;
  getLockState: (userId: string | number) => AppLockLockState;
  removeCredential: (userId: string | number) => void;
  removeLockState: (userId: string | number) => void;
  saveCredential: (
    userId: string | number,
    credential: AppLockCredential,
  ) => void;
  saveLockState: (userId: string | number, state: AppLockLockState) => void;
}

function credentialKey(userId: string | number) {
  return `app-lock:${userId}:credential`;
}
function lockStateKey(userId: string | number) {
  return `app-lock:${userId}:lock-state`;
}

function isBase64(value: unknown, expectedBytes: number) {
  if (typeof value !== 'string' || !value)
    return false;
  try {
    return atob(value).length === expectedBytes;
  }
  catch {
    return false;
  }
}

function isCredential(value: unknown): value is AppLockCredential {
  if (!value || typeof value !== 'object')
    return false;
  const credential = value as Partial<AppLockCredential>;
  const iterations = credential.iterations;
  return credential.algorithm === 'PBKDF2-SHA256'
    && typeof iterations === 'number'
    && Number.isSafeInteger(iterations)
    && iterations > 0
    && iterations <= 1_000_000
    && isBase64(credential.salt, 16)
    && isBase64(credential.digest, 32);
}

function isLockState(value: unknown): value is AppLockLockState {
  if (!value || typeof value !== 'object')
    return false;
  const state = value as Partial<AppLockLockState>;
  const failedAttempts = state.failedAttempts;
  return typeof failedAttempts === 'number'
    && Number.isSafeInteger(failedAttempts)
    && failedAttempts >= 0
    && (state.lockedUntil === null
      || (typeof state.lockedUntil === 'number'
        && Number.isFinite(state.lockedUntil)));
}

function readJson<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  catch {
    return null;
  }
}

export const localAppLockStorage: AppLockStorage = {
  getCredentialStatus: (userId) => {
    try {
      const raw = globalThis.localStorage?.getItem(credentialKey(userId));
      if (!raw)
        return 'missing';
      return localAppLockStorage.getCredential(userId) ? 'valid' : 'corrupted';
    }
    catch {
      return 'corrupted';
    }
  },
  getCredential: (userId) => {
    const value = readJson<AppLockCredential>(credentialKey(userId));
    return isCredential(value) ? value : null;
  },
  getLockState: (userId) => {
    const value = readJson<AppLockLockState>(lockStateKey(userId));
    return isLockState(value)
      ? value
      : { failedAttempts: 0, lockedUntil: null };
  },
  removeCredential: userId =>
    globalThis.localStorage?.removeItem(credentialKey(userId)),
  removeLockState: userId =>
    globalThis.localStorage?.removeItem(lockStateKey(userId)),
  saveCredential: (userId, credential) =>
    globalThis.localStorage?.setItem(
      credentialKey(userId),
      JSON.stringify(credential),
    ),
  saveLockState: (userId, state) =>
    globalThis.localStorage?.setItem(
      lockStateKey(userId),
      JSON.stringify(state),
    ),
};
