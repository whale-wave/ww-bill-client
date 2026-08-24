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
    if (
      !value
      || value.algorithm !== 'PBKDF2-SHA256'
      || !value.digest
      || !value.salt
      || !value.iterations
    ) {
      return null;
    }
    return value;
  },
  getLockState: userId =>
    readJson<AppLockLockState>(lockStateKey(userId)) ?? {
      failedAttempts: 0,
      lockedUntil: null,
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
