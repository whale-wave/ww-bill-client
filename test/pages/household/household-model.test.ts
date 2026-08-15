import { describe, expect, it } from 'vitest';
import { FamilyRecordPolicy } from '@/entities/household';
import {
  buildMonthRecordRange,
  formatCountdown,
  formatMonthStart,
  getDisplayName,
  getFamilyRecordPolicyBehavior,
  shiftMonth,
} from '@/features/household/model';

describe('household date model', () => {
  it('keeps month navigation and record filtering in calendar dates', () => {
    expect(formatMonthStart(new Date(2026, 6, 21))).toBe('2026-07-01');
    expect(shiftMonth('2026-01-01', -1)).toBe('2025-12-01');
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
    expect(buildMonthRecordRange('2026-02-01')).toEqual({
      endDate: '2026-02-28',
      startDate: '2026-02-01',
    });
  });

  it('formats invitation expiry without going below zero', () => {
    expect(formatCountdown(3_661_000)).toBe('01:01:01');
    expect(formatCountdown(-1)).toBe('00:00:00');
  });
});

describe('family record policy model', () => {
  it.each([
    [FamilyRecordPolicy.INHERIT, true, true],
    [FamilyRecordPolicy.SHARED_COUNTED, true, true],
    [FamilyRecordPolicy.SHARED_UNCOUNTED, true, false],
    [FamilyRecordPolicy.PRIVATE, false, false],
  ])('maps %s to visibility and statistics behavior', (policy, visible, counted) => {
    expect(getFamilyRecordPolicyBehavior(policy)).toEqual({ counted, visible });
  });
});

describe('household display name model', () => {
  it('prefers the household nickname over account names', () => {
    expect(getDisplayName({ name: 'Avan', nickname: '小明', username: 'avanboy' })).toBe('小明');
  });

  it('falls back to name, username and finally the placeholder', () => {
    expect(getDisplayName({ name: 'Avan', username: 'avanboy' })).toBe('Avan');
    expect(getDisplayName({ username: 'avanboy' })).toBe('avanboy');
    expect(getDisplayName({})).toBe('—');
  });
});
