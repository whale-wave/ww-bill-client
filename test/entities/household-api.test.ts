import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteHouseholdInvitationApi,
  getFamilyRecordPolicyApi,
  getHouseholdBudgetsApi,
  getHouseholdCalendarApi,
  getHouseholdChartPeriodsApi,
  getHouseholdChartsApi,
  getHouseholdInvitationPreviewApi,
  getHouseholdMembersApi,
  getHouseholdRecordApi,
  getHouseholdRecordsApi,
  getMyHouseholdApi,
  patchHouseholdApi,
  patchMyHouseholdNicknameApi,
  postAcceptHouseholdInvitationApi,
  postDissolveHouseholdApi,
  postHouseholdApi,
  postHouseholdInvitationApi,
  putFamilyRecordPolicyApi,
  putHouseholdBudgetApi,
} from '@/entities/household/api';
import { FamilyRecordPolicy, HouseholdBudgetPeriodType } from '@/entities/household/types';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ request }));

describe('household api', () => {
  beforeEach(() => Object.values(request).forEach(mock => mock.mockReset()));

  it('creates and reads the current household', () => {
    const data = {
      idempotencyKey: 'household-1',
      sharedStartMonth: '2026-07-01',
      sharingConsentConfirmed: true as const,
    };
    postHouseholdApi(data);
    getMyHouseholdApi();
    expect(request.post).toHaveBeenCalledWith('/households', data);
    expect(request.get).toHaveBeenCalledWith('/households/mine');
  });

  it('uses URL-safe household, invitation and record identifiers', () => {
    getHouseholdMembersApi('household/a b');
    postHouseholdInvitationApi('household/a b', {
      sharingConsentConfirmed: true,
    });
    deleteHouseholdInvitationApi('household/a b', 'invite/a b');
    getHouseholdInvitationPreviewApi('AB/C D');
    getFamilyRecordPolicyApi('household/a b', 7);
    getHouseholdRecordApi('household/a b', 7);
    postAcceptHouseholdInvitationApi('AB/C D', {
      expectedHouseholdVersion: 4,
      expectedSharedStartMonth: '2026-07-01',
      nickname: '小勇',
      sharingConsentConfirmed: true,
    });
    putFamilyRecordPolicyApi('household/a b', 7, {
      policy: FamilyRecordPolicy.PRIVATE,
      version: 2,
    });

    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa%20b/members');
    expect(request.post).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/invitations',
      { sharingConsentConfirmed: true },
    );
    expect(request.delete).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/invitations/invite%2Fa%20b',
    );
    expect(request.get).toHaveBeenCalledWith('/household-invitations/AB%2FC%20D');
    expect(request.get).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/records/7/policy',
    );
    expect(request.get).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/records/7',
    );
    expect(request.post).toHaveBeenCalledWith(
      '/household-invitations/AB%2FC%20D/accept',
      {
        expectedHouseholdVersion: 4,
        expectedSharedStartMonth: '2026-07-01',
        nickname: '小勇',
        sharingConsentConfirmed: true,
      },
    );
    expect(request.put).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/records/7/policy',
      { policy: FamilyRecordPolicy.PRIVATE, version: 2 },
    );
  });

  it('passes record filters and optimistic update contracts unchanged', () => {
    const params = {
      endDate: '2026-07-31T23:59:59.999Z',
      keyword: '餐',
      limit: 100,
      memberUserId: 7,
      offset: 0,
      startDate: '2026-07-01T00:00:00.000Z',
      type: 'sub' as const,
    };
    getHouseholdRecordsApi('household/a', params);
    patchHouseholdApi('household/a', {
      sharedStartMonth: '2026-06-01',
      version: 3,
    });
    patchMyHouseholdNicknameApi('household/a', { nickname: '阿勇', version: 2 });
    postDissolveHouseholdApi('household/a', {
      confirmed: true,
      reason: '不再共享',
      version: 3,
    });

    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa/records', {
      params,
    });
    expect(request.patch).toHaveBeenCalledWith('/households/household%2Fa', {
      sharedStartMonth: '2026-06-01',
      version: 3,
    });
    expect(request.patch).toHaveBeenCalledWith(
      '/households/household%2Fa/members/me',
      { nickname: '阿勇', version: 2 },
    );
    expect(request.post).toHaveBeenCalledWith('/households/household%2Fa/dissolve', {
      confirmed: true,
      reason: '不再共享',
      version: 3,
    });
  });

  it('uses canonical household budget, chart and calendar routes', () => {
    getHouseholdBudgetsApi('household/a', {
      periodStart: '2026-07-01',
      periodType: HouseholdBudgetPeriodType.MONTH,
    });
    putHouseholdBudgetApi('household/a', {
      amount: '10000.00',
      periodStart: '2026-07-01',
      periodType: HouseholdBudgetPeriodType.MONTH,
    });
    getHouseholdChartsApi('household/a', {
      anchorDate: '2026-07-21',
      display: 'pie',
      metric: 'expense',
      period: 'month',
    });
    getHouseholdChartPeriodsApi('household/a', {
      metric: 'expense',
      period: 'week',
    });
    getHouseholdCalendarApi('household/a', { month: '2026-07-01' });

    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa/budgets', {
      params: { periodStart: '2026-07-01', periodType: 'MONTH' },
    });
    expect(request.put).toHaveBeenCalledWith('/households/household%2Fa/budgets', {
      amount: '10000.00',
      periodStart: '2026-07-01',
      periodType: 'MONTH',
    });
    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa/charts', {
      params: {
        anchorDate: '2026-07-21',
        display: 'pie',
        metric: 'expense',
        period: 'month',
      },
    });
    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa/charts/periods', {
      params: { metric: 'expense', period: 'week' },
    });
    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa/calendar', {
      params: { month: '2026-07-01' },
    });
  });
});
