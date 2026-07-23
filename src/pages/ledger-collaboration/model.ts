import type { PatchLedgerMemberApiData } from '@/entities/ledger';
import {
  LedgerCapability,
  LedgerRole,
} from '@/entities/ledger';

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function normalizeInvitationCode(value: string) {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function validateJoinRequest(codeValue: string, remarkValue: string) {
  const code = normalizeInvitationCode(codeValue);
  const remark = remarkValue.trim();
  if (!code)
    throw new Error('codeRequired');
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code))
    throw new Error('codeInvalid');
  if (!remark)
    throw new Error('remarkRequired');
  if (remark.length > 30)
    throw new Error('remarkTooLong');
  return { code, remark };
}

export function getAssignableRoles(currentRole?: LedgerRole) {
  if (currentRole === LedgerRole.OWNER) {
    return [LedgerRole.ADMIN, LedgerRole.BOOKKEEPER, LedgerRole.VIEWER] as const;
  }
  if (currentRole === LedgerRole.ADMIN) {
    return [LedgerRole.BOOKKEEPER, LedgerRole.VIEWER] as const;
  }
  return [] as const;
}

export function canEditMemberRole(currentRole: LedgerRole, targetRole: LedgerRole) {
  if (targetRole === LedgerRole.OWNER)
    return false;
  if (currentRole === LedgerRole.OWNER)
    return true;
  return currentRole === LedgerRole.ADMIN
    && [LedgerRole.BOOKKEEPER, LedgerRole.VIEWER].includes(targetRole);
}

export function canEditMemberNickname(
  currentUserId: number | undefined,
  targetUserId: number,
  capabilities: readonly LedgerCapability[],
) {
  return currentUserId === targetUserId
    || capabilities.includes(LedgerCapability.MEMBER_MANAGE);
}

interface ValidateMemberPatchOptions {
  initialNickname: string;
  initialRole: LedgerRole;
  nickname: string;
  role: LedgerRole;
  version: number;
}

export function validateMemberPatch(
  options: ValidateMemberPatchOptions,
): PatchLedgerMemberApiData {
  const nickname = options.nickname.trim();
  if (nickname.length > 30)
    throw new Error('nicknameTooLong');

  const data: PatchLedgerMemberApiData = { version: options.version };
  if (nickname !== options.initialNickname)
    data.nickname = nickname;
  if (options.role !== options.initialRole) {
    if (options.role === LedgerRole.OWNER)
      throw new Error('invalidRole');
    data.role = options.role;
  }
  if (data.nickname === undefined && data.role === undefined)
    throw new Error('noChanges');
  return data;
}

export function getLedgerUserDisplayName(user: {
  name?: string;
  nickname?: string;
  username?: string;
}, fallback: string) {
  return user.nickname || user.name || user.username || fallback;
}

export function createIdempotencyKey(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export function formatCountdown(expiresAt: string, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map(value => String(value).padStart(2, '0'))
    .join(':');
}
