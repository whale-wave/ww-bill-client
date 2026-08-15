import type { HouseholdInvitation } from '@/entities/household';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdInvitationStatus } from '@/entities/household';
import {
  readHouseholdInvitation,
  removeHouseholdInvitation,
  writeHouseholdInvitation,
} from '@/entities/household/invitation-storage';

const householdId = 'household/a';
const storageKey = `wh:invitation:${householdId}`;

function invitation(overrides: Partial<HouseholdInvitation> = {}): HouseholdInvitation {
  return {
    id: 'invite/a',
    householdId,
    code: 'ABC123',
    status: HouseholdInvitationStatus.ACTIVE,
    expiresAt: '2099-01-01T00:00:00.000Z',
    version: 1,
    ...overrides,
  };
}

describe('household invitation storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('restores the same invitation after a write', () => {
    writeHouseholdInvitation(householdId, invitation());

    expect(readHouseholdInvitation(householdId)).toEqual(invitation());
  });

  it('removes the stored invitation explicitly', () => {
    writeHouseholdInvitation(householdId, invitation());
    removeHouseholdInvitation(householdId);

    expect(readHouseholdInvitation(householdId)).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('rejects an expired invitation and clears the damaged entry', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      householdId,
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2020-01-01T00:00:00.000Z',
    }));

    expect(readHouseholdInvitation(householdId)).toBeNull();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('rejects a stored invitation belonging to another household', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      householdId: 'household/b',
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }));

    expect(readHouseholdInvitation(householdId)).toBeNull();
  });

  it('ignores corrupt JSON without throwing', () => {
    localStorage.setItem(storageKey, '{not-json');

    expect(readHouseholdInvitation(householdId)).toBeNull();
  });

  it('ignores an unknown schema version', () => {
    localStorage.setItem(storageKey, JSON.stringify({
      version: 2,
      householdId,
      id: 'invite/a',
      code: 'ABC123',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }));

    expect(readHouseholdInvitation(householdId)).toBeNull();
  });

  it('ignores an empty code', () => {
    writeHouseholdInvitation(householdId, invitation({ code: '  ' }));

    expect(readHouseholdInvitation(householdId)).toBeNull();
  });
});
