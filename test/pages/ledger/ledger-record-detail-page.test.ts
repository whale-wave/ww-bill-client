import type { ReactNode } from 'react';
import type { Household } from '@/entities/household';
import type { Ledger } from '@/entities/ledger';
import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FamilyRecordPolicy,
  HouseholdMemberRole,
  HouseholdStatus,
} from '@/entities/household';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import LedgerRecordDetailPage from '@/pages/ledger-record-detail/LedgerRecordDetailPage';

const hooks = vi.hoisted(() => ({
  deleteRecord: vi.fn(),
  refetchRecord: vi.fn(),
  useDeleteLedgerRecordMutation: vi.fn(),
  useFamilyRecordPolicyQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerQuery: hooks.useLedgerQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useDeleteLedgerRecordMutation: hooks.useDeleteLedgerRecordMutation,
  useLedgerRecordQuery: hooks.useLedgerRecordQuery,
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useFamilyRecordPolicyQuery: hooks.useFamilyRecordPolicyQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const ledger: Ledger = {
  capabilities: [
    LedgerCapability.RECORD_READ,
    LedgerCapability.RECORD_UPDATE,
    LedgerCapability.RECORD_DELETE,
  ],
  createdAt: '2026-07-01T00:00:00.000Z',
  createdByUserId: 7,
  iconKey: 'wallet',
  id: 'ledger/a',
  kind: LedgerKind.SYSTEM_DEFAULT,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '个人账本',
  ownerUserId: 7,
  status: LedgerStatus.ACTIVE,
  templateKey: 'system-default',
  themeKey: 'blue',
  updatedAt: '2026-07-01T00:00:00.000Z',
  version: 2,
};

const household: Household = {
  activatedAt: '2026-07-01T00:00:00.000Z',
  createdAt: '2026-07-01T00:00:00.000Z',
  id: 'household/a',
  members: [],
  myRole: HouseholdMemberRole.OWNER,
  sharedStartMonth: '2026-07-01',
  status: HouseholdStatus.ACTIVE,
  updatedAt: '2026-07-01T00:00:00.000Z',
  version: 1,
};

const record: RecordEntry = {
  amount: '20.00',
  category: {
    createdAt: '2026-07-01T00:00:00.000Z',
    icon: 'meal',
    id: 1,
    name: '餐饮',
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
  createdAt: '2026-07-21T12:00:00.000Z',
  id: 7,
  ledgerId: ledger.id,
  remark: '晚餐',
  tags: [],
  time: '2026-07-21T12:00:00.000Z',
  type: 'sub',
  updatedAt: '2026-07-21T12:00:00.000Z',
  version: 4,
};

let cleanup: (() => void) | undefined;

function renderPage(element: ReactNode = createElement(LedgerRecordDetailPage)) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/ledgers/:ledgerId/records/:recordId', element },
    { path: '/households/:householdId/records/:recordId/policy', element: createElement('div', null, 'policy-target') },
    { path: '/ledgers/:ledgerId/records', element: createElement('div', null, 'records-target') },
  ], { initialEntries: ['/ledgers/ledger%2Fa/records/7'] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useLedgerQuery.mockReturnValue({ data: ledger, isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useLedgerRecordQuery.mockReturnValue({ data: record, isLoading: false, refetch: hooks.refetchRecord });
  hooks.useDeleteLedgerRecordMutation.mockReturnValue([hooks.deleteRecord, { isLoading: false }]);
  hooks.useMyHouseholdQuery.mockReturnValue({ data: household, isLoading: false });
  hooks.useFamilyRecordPolicyQuery.mockReturnValue({
    data: {
      effectivePolicy: FamilyRecordPolicy.PRIVATE,
      householdId: household.id,
      policy: FamilyRecordPolicy.PRIVATE,
      recordId: record.id,
      version: 3,
    },
    isLoading: false,
  });
  hooks.deleteRecord.mockResolvedValue({ statusCode: 200 });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger record detail family policy and concurrency', () => {
  it('keeps a private default-ledger record reachable so sharing can be restored', async () => {
    const { container, router } = renderPage();

    expect(hooks.useFamilyRecordPolicyQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', recordId: 7 },
      queryOptions: { enabled: true },
    });
    expect(container.textContent).toContain('records.familyPolicyStates.PRIVATE');

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-record-family-policy"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7/policy');
  });

  it('deletes with the version loaded on the detail page', async () => {
    const { container } = renderPage();

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-record-delete"]')?.click());
    expect(hooks.deleteRecord).toHaveBeenCalledWith({
      ledgerId: 'ledger/a',
      recordId: '7',
      version: 4,
    });
  });
});
