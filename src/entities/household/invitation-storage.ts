import type { HouseholdInvitation } from './types';
import { HouseholdInvitationStatus } from './types';

interface StoredHouseholdInvitation {
  version: 1;
  householdId: string;
  id: string;
  code: string;
  expiresAt: string;
}

const STORAGE_KEY_PREFIX = 'wh:invitation:';

function buildStorageKey(householdId: string) {
  return `${STORAGE_KEY_PREFIX}${householdId}`;
}

function isStoredHouseholdInvitation(value: unknown): value is StoredHouseholdInvitation {
  if (typeof value !== 'object' || value === null)
    return false;
  const candidate = value as Partial<StoredHouseholdInvitation>;
  return candidate.version === 1
    && typeof candidate.householdId === 'string'
    && typeof candidate.id === 'string'
    && typeof candidate.code === 'string'
    && typeof candidate.expiresAt === 'string';
}

function readRawInvitation(householdId: string): StoredHouseholdInvitation | null {
  try {
    const raw = globalThis.localStorage?.getItem(buildStorageKey(householdId));
    if (!raw)
      return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredHouseholdInvitation(parsed) || parsed.householdId !== householdId)
      return null;
    return parsed;
  }
  catch {
    return null;
  }
}

export function readHouseholdInvitation(householdId: string): HouseholdInvitation | null {
  const stored = readRawInvitation(householdId);
  if (!stored || !stored.code.trim()) {
    removeHouseholdInvitation(householdId);
    return null;
  }
  const expiresAt = Date.parse(stored.expiresAt);
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    removeHouseholdInvitation(householdId);
    return null;
  }
  return {
    id: stored.id,
    householdId: stored.householdId,
    code: stored.code,
    status: HouseholdInvitationStatus.ACTIVE,
    expiresAt: stored.expiresAt,
    version: stored.version,
  };
}

export function writeHouseholdInvitation(householdId: string, invitation: HouseholdInvitation) {
  try {
    const stored: StoredHouseholdInvitation = {
      version: 1,
      householdId,
      id: invitation.id,
      code: invitation.code,
      expiresAt: invitation.expiresAt,
    };
    globalThis.localStorage?.setItem(buildStorageKey(householdId), JSON.stringify(stored));
  }
  catch {
    // localStorage unavailable (e.g. private mode); in-memory query cache remains the fallback
  }
}

export function removeHouseholdInvitation(householdId: string) {
  try {
    globalThis.localStorage?.removeItem(buildStorageKey(householdId));
  }
  catch {
    // ignore unavailable storage
  }
}
