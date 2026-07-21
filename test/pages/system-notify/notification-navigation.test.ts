import { describe, expect, it } from 'vitest';
import { getNotificationTarget } from '@/pages/system-notify/model';

describe('notification payload navigation', () => {
  it('opens a join request only for the whitelisted review action', () => {
    expect(getNotificationTarget({
      action: 'review',
      joinRequestId: 'request/a',
      ledgerId: 'ledger/a',
    })).toBe('/ledgers/ledger%2Fa/join-requests/request%2Fa');
  });

  it('opens existing ledger and application pages for explicit actions', () => {
    expect(getNotificationTarget({
      action: 'open-ledger',
      ledgerId: 'ledger/a',
    })).toBe('/ledgers/ledger%2Fa');
    expect(getNotificationTarget({
      action: 'open-applications',
    })).toBe('/ledgers/applications');
    expect(getNotificationTarget({ action: 'open-ledgers' })).toBe('/ledgers');
  });

  it('opens active household detail or the safe household entry', () => {
    expect(getNotificationTarget({
      action: 'open-household',
      householdId: 'household/a',
    })).toBe('/households/household%2Fa');
    expect(getNotificationTarget({
      action: 'open-household-entry',
    })).toBe('/household');
  });

  it.each([
    [{ action: 'archive', ledgerId: 'ledger-1' }],
    [{ action: 'review', ledgerId: 'ledger-1' }],
    [{ action: 'open-ledger', ledgerId: 123 }],
    [{ action: 'open-household' }],
    [{ ledgerId: 'ledger-1' }],
    [null],
  ])('does not navigate for unknown or incomplete payload %j', (payload) => {
    expect(getNotificationTarget(payload)).toBeUndefined();
  });
});
