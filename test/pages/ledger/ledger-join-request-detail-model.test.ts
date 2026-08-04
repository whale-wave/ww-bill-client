import { describe, expect, it } from 'vitest';
import { LedgerRole } from '@/entities/ledger';
import {
  getJoinRequestPermissionGroups,
  getJoinRequestRoleDescriptionKey,
} from '@/pages/ledger-join-request-detail/model';

describe('join request role presentation model', () => {
  it('maps viewer to browse-only permissions', () => {
    expect(getJoinRequestPermissionGroups(LedgerRole.VIEWER).map(group => group.key))
      .toEqual(['browse']);
  });

  it('maps bookkeeper to browse and record permissions', () => {
    expect(getJoinRequestPermissionGroups(LedgerRole.BOOKKEEPER).map(group => group.key))
      .toEqual(['browse', 'records']);
  });

  it('maps admin to the complete management permission preview', () => {
    expect(getJoinRequestPermissionGroups(LedgerRole.ADMIN).map(group => group.key))
      .toEqual(['browse', 'records', 'budget', 'ledgerManagement']);
  });

  it('returns stable role-description translation keys', () => {
    expect(getJoinRequestRoleDescriptionKey(LedgerRole.ADMIN))
      .toBe('requestDetail.roleDescriptions.ADMIN');
    expect(getJoinRequestRoleDescriptionKey(LedgerRole.BOOKKEEPER))
      .toBe('requestDetail.roleDescriptions.BOOKKEEPER');
    expect(getJoinRequestRoleDescriptionKey(LedgerRole.VIEWER))
      .toBe('requestDetail.roleDescriptions.VIEWER');
  });
});
