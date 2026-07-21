import type {
  CreatableLedgerTemplateKey,
  Ledger,
  LedgerInvitation,
  LedgerInvitationPreview,
  LedgerJoinRequest,
  LedgerMember,
  LedgerTemplate,
  LedgerTemplateKey,
  PostLedgerApiData,
} from '@/entities/ledger';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  LedgerCapability,
  LedgerInvitationStatus,
  LedgerJoinDecision,
  LedgerJoinRequestStatus,
  LedgerKind,
  LedgerMemberStatus,
  LedgerRole,
  LedgerStatus,
  PUBLIC_LEDGER_TEMPLATE_KEYS,
} from '@/entities/ledger';

describe('ledger domain contract', () => {
  it('keeps ledger roles aligned with the service contract', () => {
    expect(Object.values(LedgerRole)).toEqual([
      'OWNER',
      'ADMIN',
      'BOOKKEEPER',
      'VIEWER',
    ]);
  });

  it('keeps lifecycle enums aligned with the service contract', () => {
    expect(Object.values(LedgerKind)).toEqual(['SYSTEM_DEFAULT', 'CUSTOM']);
    expect(Object.values(LedgerStatus)).toEqual(['ACTIVE', 'SUSPENDED', 'ARCHIVED']);
    expect(Object.values(LedgerMemberStatus)).toEqual(['ACTIVE', 'LEFT', 'REMOVED']);
    expect(Object.values(LedgerInvitationStatus)).toEqual([
      'ACTIVE',
      'CONSUMED',
      'REVOKED',
      'EXPIRED',
    ]);
    expect(Object.values(LedgerJoinRequestStatus)).toEqual([
      'PENDING',
      'APPROVED',
      'REJECTED',
      'IGNORED',
      'CANCELLED',
      'EXPIRED',
    ]);
    expect(Object.values(LedgerJoinDecision)).toEqual([
      'APPROVED',
      'REJECTED',
      'IGNORED',
    ]);
  });

  it('defines collaboration response fields without losing versions', () => {
    expectTypeOf<LedgerInvitation['version']>().toEqualTypeOf<number>();
    expectTypeOf<LedgerInvitationPreview['owner']['id']>().toEqualTypeOf<number>();
    expectTypeOf<LedgerJoinRequest['applicantRemark']>().toEqualTypeOf<string>();
    expectTypeOf<LedgerJoinRequest['version']>().toEqualTypeOf<number>();
    expectTypeOf<LedgerMember['capabilities']>()
      .toEqualTypeOf<readonly LedgerCapability[]>();
    expectTypeOf<LedgerMember['leftAt']>().toEqualTypeOf<string | undefined>();
  });

  it('keeps authorization capabilities aligned with the service contract', () => {
    expect(Object.values(LedgerCapability)).toEqual([
      'ledger:read',
      'ledger:update',
      'ledger:archive',
      'member:read',
      'member:invite',
      'member:review',
      'member:manage',
      'record:read',
      'record:create',
      'record:update',
      'record:delete',
      'category:read',
      'category:manage',
      'tag:read',
      'tag:manage',
      'budget:read',
      'budget:manage',
      'chart:read',
      'data:export',
      'data:recovery',
      'data:transfer',
      'ownership:transfer',
    ]);
  });

  it('exposes the six public templates through the create contract', () => {
    expect(PUBLIC_LEDGER_TEMPLATE_KEYS).toEqual([
      'business',
      'reimbursement',
      'company',
      'team',
      'micro-business',
      'custom',
    ]);
    expectTypeOf<PostLedgerApiData['templateKey']>()
      .toEqualTypeOf<CreatableLedgerTemplateKey>();
  });

  it('allows system-default only on persisted ledgers', () => {
    expectTypeOf<LedgerTemplateKey>()
      .toEqualTypeOf<CreatableLedgerTemplateKey | 'system-default'>();
    expectTypeOf<Ledger['templateKey']>()
      .toEqualTypeOf<LedgerTemplateKey | undefined>();
  });

  it('defines the public template catalog fields', () => {
    expectTypeOf<LedgerTemplate['version']>().toEqualTypeOf<1>();

    const template: LedgerTemplate = {
      categoryProfileKey: 'business-v1',
      defaultName: '生意账本',
      description: '经营收支',
      iconKey: 'store',
      key: 'business',
      name: '生意账本',
      themeKey: 'green',
      version: 1,
    };

    expect(Object.keys(template).sort()).toEqual([
      'categoryProfileKey',
      'defaultName',
      'description',
      'iconKey',
      'key',
      'name',
      'themeKey',
      'version',
    ]);
  });
});
