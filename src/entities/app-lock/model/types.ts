export interface AppLockCredential {
  algorithm: 'PBKDF2-SHA256';
  digest: string;
  iterations: number;
  salt: string;
}

export interface AppLockLockState {
  failedAttempts: number;
  lockedUntil: number | null;
}

export type AppLockStatus
  = | 'disabled'
    | 'ready'
    | 'missingCredential'
    | 'corruptedCredential'
    | 'locked';
