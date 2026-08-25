import type { LedgerInvitation } from '@/entities/ledger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerInvitationStatus } from '@/entities/ledger';
import {
  readLedgerInvitation,
  removeLedgerInvitation,
  writeLedgerInvitation,
} from '@/entities/ledger/invitation-storage';

const ledgerId = 'ledger/a';
const storageKey = `wh:ledger-invitation:${ledgerId}`;

function invitation(overrides: Partial<LedgerInvitation> = {}): LedgerInvitation {
  return {
    id: 'invite/a',
    ledgerId,
    code: 'ABC123',
    status: LedgerInvitationStatus.ACTIVE,
    expiresAt: '2099-01-01T00:00:00.000Z',
    version: 7,
    ...overrides,
  };
}

describe('ledger invitation storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('restores the same invitation after a write and keeps the server version', () => {
    writeLedgerInvitation(ledgerId, invitation());

    expect(readLedgerInvitation(ledgerId)).toEqual(invitation());
    expect(readLedgerInvitation(ledgerId)?.version).toBe(7);
  });

  it('stores the schema version separately from the invitation version', () => {
    writeLedgerInvitation(ledgerId, invitation());

    const raw = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    expect(raw.schemaVersion).toBe(1);
    expect(raw.invitationVersion).toBe(7);
  });

  it('removes the stored invitation explicitly', () => {
    writeLedgerInvitation(ledgerId, invitation());
    removeLedgerInvitation(ledgerId);

    expect(readLedgerInvitation(ledgerId)).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('rejects an expired invitation and clears the damaged entry', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      ledgerId,
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2020-01-01T00:00:00.000Z',
      invitationVersion: 7,
    }));

    expect(readLedgerInvitation(ledgerId)).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('rejects a stored invitation belonging to another ledger', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      ledgerId: 'ledger/b',
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
      invitationVersion: 7,
    }));

    expect(readLedgerInvitation(ledgerId)).toBeNull();
  });

  it('ignores corrupt JSON without throwing', () => {
    localStorage.setItem(storageKey, '{not-json');

    expect(readLedgerInvitation(ledgerId)).toBeNull();
  });

  it('ignores an unknown schema version', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 2,
      ledgerId,
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
      invitationVersion: 7,
    }));

    expect(readLedgerInvitation(ledgerId)).toBeNull();
  });

  it('ignores a missing invitation version', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: 1,
      ledgerId,
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }));

    expect(readLedgerInvitation(ledgerId)).toBeNull();
  });

  it('ignores an empty code', () => {
    writeLedgerInvitation(ledgerId, invitation({ code: '  ' }));

    expect(readLedgerInvitation(ledgerId)).toBeNull();
  });
});
