import { describe, expect, it } from 'vitest';
import {
  ledgerKeys,
  LedgerKind,
  LedgerMemberStatus,
  LedgerStatus,
} from '@/entities/ledger';

describe('ledger query keys', () => {
  it('isolates list filters', () => {
    const activeCustom = ledgerKeys.list({
      kind: LedgerKind.CUSTOM,
      status: LedgerStatus.ACTIVE,
    });
    const archivedCustom = ledgerKeys.list({
      kind: LedgerKind.CUSTOM,
      status: LedgerStatus.ARCHIVED,
    });

    expect(activeCustom).toEqual([
      'ledger',
      'list',
      { kind: 'CUSTOM', status: 'ACTIVE' },
    ]);
    expect(archivedCustom).not.toEqual(activeCustom);
  });

  it('isolates ledger details by ledger id', () => {
    expect(ledgerKeys.detail('ledger/a')).toEqual([
      'ledger',
      'detail',
      'ledger/a',
    ]);
    expect(ledgerKeys.detail('ledger/b')).not.toEqual(ledgerKeys.detail('ledger/a'));
  });

  it('keeps the template catalog outside ledger detail keys', () => {
    expect(ledgerKeys.templates()).toEqual(['ledger', 'template']);
    expect(ledgerKeys.templates()).not.toEqual(ledgerKeys.details());
  });

  it('isolates invitation previews, join requests and member filters', () => {
    expect(ledgerKeys.invitationPreview('AB/C D')).toEqual([
      'ledger',
      'invitation-preview',
      'AB/C D',
    ]);
    expect(ledgerKeys.myJoinRequests()).toEqual([
      'ledger',
      'join-request',
      'mine',
    ]);
    expect(ledgerKeys.joinRequests('ledger/a')).toEqual([
      'ledger',
      'join-request',
      'ledger',
      'ledger/a',
    ]);
    expect(ledgerKeys.members('ledger/a', { status: LedgerMemberStatus.ACTIVE })).toEqual([
      'ledger',
      'member',
      'ledger/a',
      { status: 'ACTIVE' },
    ]);
    expect(ledgerKeys.membersRoot('ledger/a')).toEqual([
      'ledger',
      'member',
      'ledger/a',
    ]);
  });
});
