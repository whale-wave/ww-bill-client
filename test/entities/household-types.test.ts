import type {
  FamilyRecord,
  Household,
  HouseholdBudget,
  HouseholdInvitationPreview,
} from '@/entities/household';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  FamilyRecordPolicy,
  HouseholdBudgetPeriodType,
  HouseholdInvitationStatus,
  HouseholdMemberRole,
  HouseholdStatus,
} from '@/entities/household';

describe('household domain contract', () => {
  it('matches service lifecycle and four-state record policy enums', () => {
    expect(Object.values(HouseholdStatus)).toEqual([
      'PENDING_PARTNER',
      'ACTIVE',
      'DISSOLVED',
    ]);
    expect(Object.values(HouseholdMemberRole)).toEqual(['OWNER', 'PARTNER']);
    expect(Object.values(HouseholdInvitationStatus)).toEqual([
      'ACTIVE',
      'CONSUMED',
      'REVOKED',
      'EXPIRED',
    ]);
    expect(Object.values(FamilyRecordPolicy)).toEqual([
      'INHERIT',
      'SHARED_COUNTED',
      'SHARED_UNCOUNTED',
      'PRIVATE',
    ]);
    expect(Object.values(HouseholdBudgetPeriodType)).toEqual(['MONTH', 'YEAR']);
  });

  it('preserves household, record and budget optimistic versions', () => {
    expectTypeOf<Household['version']>().toEqualTypeOf<number>();
    expectTypeOf<FamilyRecord['policyVersion']>()
      .toEqualTypeOf<number | undefined>();
    expectTypeOf<HouseholdBudget['version']>().toEqualTypeOf<number>();
    expectTypeOf<HouseholdInvitationPreview['creator']['id']>()
      .toEqualTypeOf<number>();
    expectTypeOf<HouseholdInvitationPreview['householdVersion']>()
      .toEqualTypeOf<number>();
  });
});
