import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  acceptHouseholdInvitationMutationFn,
  createHouseholdMutationFn,
  getFamilyRecordPolicyQueryFn,
  getHouseholdBudgetsQueryFn,
  getHouseholdCalendarQueryFn,
  getHouseholdChartsQueryFn,
  getHouseholdInvitationPreviewQueryFn,
  getHouseholdMembersQueryFn,
  getHouseholdRecordQueryFn,
  getHouseholdRecordsQueryFn,
  getMyHouseholdQueryFn,
  getNextHouseholdRecordsOffset,
  setFamilyRecordPolicyMutationFn,
} from '@/entities/household/hooks';
import { FamilyRecordPolicy, HouseholdBudgetPeriodType } from '@/entities/household/types';

const api = vi.hoisted(() => ({
  getFamilyRecordPolicyApi: vi.fn(),
  getHouseholdInvitationPreviewApi: vi.fn(),
  getHouseholdMembersApi: vi.fn(),
  getHouseholdRecordApi: vi.fn(),
  getHouseholdRecordsApi: vi.fn(),
  getHouseholdBudgetsApi: vi.fn(),
  getHouseholdCalendarApi: vi.fn(),
  getHouseholdChartsApi: vi.fn(),
  getMyHouseholdApi: vi.fn(),
  postAcceptHouseholdInvitationApi: vi.fn(),
  postHouseholdApi: vi.fn(),
  putFamilyRecordPolicyApi: vi.fn(),
}));

vi.mock('@/entities/household/api', () => api);

const failedEnvelope = { data: null, message: '版本冲突', statusCode: 409 };

describe('household React Query functions', () => {
  beforeEach(() => Object.values(api).forEach(mock => mock.mockReset()));

  it('continues household record paging until the server total is reached', () => {
    expect(getNextHouseholdRecordsOffset({
      data: Array.from({ length: 50 }, () => ({} as never)),
      offset: 0,
      total: 101,
    })).toBe(50);
    expect(getNextHouseholdRecordsOffset({
      data: [{} as never],
      offset: 100,
      total: 101,
    })).toBeUndefined();
  });

  it.each([
    ['mine', () => {
      api.getMyHouseholdApi.mockResolvedValue(failedEnvelope);
      return getMyHouseholdQueryFn();
    }],
    ['members', () => {
      api.getHouseholdMembersApi.mockResolvedValue(failedEnvelope);
      return getHouseholdMembersQueryFn('h-1');
    }],
    ['records', () => {
      api.getHouseholdRecordsApi.mockResolvedValue(failedEnvelope);
      return getHouseholdRecordsQueryFn('h-1', { keyword: '餐' });
    }],
    ['record detail', () => {
      api.getHouseholdRecordApi.mockResolvedValue(failedEnvelope);
      return getHouseholdRecordQueryFn('h-1', 7);
    }],
    ['record policy', () => {
      api.getFamilyRecordPolicyApi.mockResolvedValue(failedEnvelope);
      return getFamilyRecordPolicyQueryFn('h-1', 7);
    }],
    ['preview', () => {
      api.getHouseholdInvitationPreviewApi.mockResolvedValue(failedEnvelope);
      return getHouseholdInvitationPreviewQueryFn('CODE');
    }],
    ['budgets', () => {
      api.getHouseholdBudgetsApi.mockResolvedValue(failedEnvelope);
      return getHouseholdBudgetsQueryFn('h-1', {
        periodStart: '2026-07-01',
        periodType: HouseholdBudgetPeriodType.MONTH,
      });
    }],
    ['charts', () => {
      api.getHouseholdChartsApi.mockResolvedValue(failedEnvelope);
      return getHouseholdChartsQueryFn('h-1', {
        anchorDate: '2026-07-21',
        display: 'pie',
        metric: 'expense',
        period: 'month',
      });
    }],
    ['calendar', () => {
      api.getHouseholdCalendarApi.mockResolvedValue(failedEnvelope);
      return getHouseholdCalendarQueryFn('h-1', { month: '2026-07-01' });
    }],
    ['create', () => {
      api.postHouseholdApi.mockResolvedValue(failedEnvelope);
      return createHouseholdMutationFn({
        sharedStartMonth: '2026-07-01',
        sharingConsentConfirmed: true,
      });
    }],
    ['accept', () => {
      api.postAcceptHouseholdInvitationApi.mockResolvedValue(failedEnvelope);
      return acceptHouseholdInvitationMutationFn({
        code: 'CODE',
        data: {
          expectedHouseholdVersion: 1,
          expectedSharedStartMonth: '2026-07-01',
          sharingConsentConfirmed: true,
        },
      });
    }],
    ['policy', () => {
      api.putFamilyRecordPolicyApi.mockResolvedValue(failedEnvelope);
      return setFamilyRecordPolicyMutationFn({
        data: { policy: FamilyRecordPolicy.PRIVATE, version: 2 },
        householdId: 'h-1',
        recordId: 7,
      });
    }],
  ])('rejects a failed business envelope for %s', async (_name, execute) => {
    await expect(execute()).rejects.toMatchObject({
      message: '版本冲突',
      statusCode: 409,
    });
  });
});
