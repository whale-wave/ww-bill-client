import type { LedgerInvitation } from './types';
import { LedgerInvitationStatus } from './types';

interface StoredLedgerInvitation {
  schemaVersion: 1;
  ledgerId: string;
  id: string;
  code: string;
  expiresAt: string;
  invitationVersion: number;
}

const STORAGE_KEY_PREFIX = 'wh:ledger-invitation:';

export function clearLedgerInvitationCache() {
  try {
    const storage = globalThis.localStorage;
    if (!storage)
      return;
    for (let index = storage.length - 1; index >= 0; index--) {
      const key = storage.key(index);
      if (key?.startsWith(STORAGE_KEY_PREFIX))
        storage.removeItem(key);
    }
  }
  catch { /* unavailable storage */ }
}

function buildStorageKey(ledgerId: string) {
  return `${STORAGE_KEY_PREFIX}${ledgerId}`;
}

function isStoredLedgerInvitation(value: unknown): value is StoredLedgerInvitation {
  if (typeof value !== 'object' || value === null)
    return false;
  const candidate = value as Partial<StoredLedgerInvitation>;
  return candidate.schemaVersion === 1
    && typeof candidate.ledgerId === 'string'
    && typeof candidate.id === 'string'
    && typeof candidate.code === 'string'
    && typeof candidate.expiresAt === 'string'
    && typeof candidate.invitationVersion === 'number';
}

function readRawInvitation(ledgerId: string): StoredLedgerInvitation | null {
  try {
    const raw = globalThis.localStorage?.getItem(buildStorageKey(ledgerId));
    if (!raw)
      return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredLedgerInvitation(parsed) || parsed.ledgerId !== ledgerId)
      return null;
    return parsed;
  }
  catch {
    return null;
  }
}

export function readLedgerInvitation(ledgerId: string): LedgerInvitation | null {
  const stored = readRawInvitation(ledgerId);
  if (!stored || !stored.code.trim()) {
    removeLedgerInvitation(ledgerId);
    return null;
  }
  const expiresAt = Date.parse(stored.expiresAt);
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    removeLedgerInvitation(ledgerId);
    return null;
  }
  return {
    id: stored.id,
    ledgerId: stored.ledgerId,
    code: stored.code,
    status: LedgerInvitationStatus.ACTIVE,
    expiresAt: stored.expiresAt,
    version: stored.invitationVersion,
  };
}

export function writeLedgerInvitation(ledgerId: string, invitation: LedgerInvitation) {
  try {
    const stored: StoredLedgerInvitation = {
      schemaVersion: 1,
      ledgerId,
      id: invitation.id,
      code: invitation.code,
      expiresAt: invitation.expiresAt,
      invitationVersion: invitation.version,
    };
    globalThis.localStorage?.setItem(buildStorageKey(ledgerId), JSON.stringify(stored));
  }
  catch {
    // localStorage unavailable (e.g. private mode); the in-memory state remains the fallback
  }
}

export function removeLedgerInvitation(ledgerId: string) {
  try {
    globalThis.localStorage?.removeItem(buildStorageKey(ledgerId));
  }
  catch {
    // ignore unavailable storage
  }
}
