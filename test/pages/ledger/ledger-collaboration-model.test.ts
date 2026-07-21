import { describe, expect, it } from 'vitest';
import { LedgerCapability, LedgerRole } from '@/entities/ledger';
import {
  canEditMemberNickname,
  canEditMemberRole,
  getAssignableRoles,
  normalizeInvitationCode,
  validateJoinRequest,
  validateMemberPatch,
} from '@/pages/ledger-collaboration/model';

describe('ledger collaboration page model', () => {
  it('normalizes codes and validates the 1-30 character remark contract', () => {
    expect(normalizeInvitationCode(' ab/c  ')).toBe('AB/C');
    expect(validateJoinRequest(' CODE ', ' 我是小勇 ')).toEqual({
      code: 'CODE',
      remark: '我是小勇',
    });
    expect(() => validateJoinRequest('', '我是小勇')).toThrow('codeRequired');
    expect(() => validateJoinRequest('CODE', ' '.repeat(2))).toThrow('remarkRequired');
    expect(() => validateJoinRequest('CODE', '勇'.repeat(31))).toThrow('remarkTooLong');
  });

  it('only offers roles the current reviewer may assign', () => {
    expect(getAssignableRoles(LedgerRole.OWNER)).toEqual([
      LedgerRole.ADMIN,
      LedgerRole.BOOKKEEPER,
      LedgerRole.VIEWER,
    ]);
    expect(getAssignableRoles(LedgerRole.ADMIN)).toEqual([
      LedgerRole.BOOKKEEPER,
      LedgerRole.VIEWER,
    ]);
    expect(getAssignableRoles(LedgerRole.BOOKKEEPER)).toEqual([]);
  });

  it('protects owner and administrator role boundaries', () => {
    expect(canEditMemberRole(LedgerRole.OWNER, LedgerRole.ADMIN)).toBe(true);
    expect(canEditMemberRole(LedgerRole.ADMIN, LedgerRole.BOOKKEEPER)).toBe(true);
    expect(canEditMemberRole(LedgerRole.ADMIN, LedgerRole.ADMIN)).toBe(false);
    expect(canEditMemberRole(LedgerRole.OWNER, LedgerRole.OWNER)).toBe(false);
  });

  it('allows self nickname editing or a member manager', () => {
    expect(canEditMemberNickname(7, 7, [])).toBe(true);
    expect(canEditMemberNickname(7, 8, [LedgerCapability.MEMBER_MANAGE])).toBe(true);
    expect(canEditMemberNickname(7, 8, [])).toBe(false);
  });

  it('requires an actual member change and preserves optimistic version', () => {
    expect(validateMemberPatch({
      initialNickname: '小勇',
      initialRole: LedgerRole.BOOKKEEPER,
      nickname: ' 小勇同学 ',
      role: LedgerRole.VIEWER,
      version: 3,
    })).toEqual({ nickname: '小勇同学', role: LedgerRole.VIEWER, version: 3 });
    expect(() => validateMemberPatch({
      initialNickname: '小勇',
      initialRole: LedgerRole.BOOKKEEPER,
      nickname: '小勇',
      role: LedgerRole.BOOKKEEPER,
      version: 3,
    })).toThrow('noChanges');
    expect(() => validateMemberPatch({
      initialNickname: '',
      initialRole: LedgerRole.VIEWER,
      nickname: '勇'.repeat(31),
      role: LedgerRole.VIEWER,
      version: 1,
    })).toThrow('nicknameTooLong');
  });
});
