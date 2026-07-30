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
import LedgerRecordsPage from '@/pages/ledger-records/LedgerRecordsPage';

const hooks = vi.hoisted(() => ({
  deleteRecord: vi.fn(),
  refetchRecord: vi.fn(),
  useDeleteLedgerRecordMutation: vi.fn(),
  useFamilyRecordPolicyQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
  useLedgerQuery: hooks.useLedgerQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useDeleteLedgerRecordMutation: hooks.useDeleteLedgerRecordMutation,
  useLedgerRecordQuery: hooks.useLedgerRecordQuery,
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useFamilyRecordPolicyQuery: hooks.useFamilyRecordPolicyQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/ledger-switcher', () => ({
  LedgerTitleSwitcher: ({ ledgerName }: { ledgerName: string }) =>
    createElement('span', null, ledgerName),
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
  hooks.useLedgerPreferencesQuery.mockReturnValue({
    data: { hideTotalAmount: false, showDailySummary: true },
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerRecordQuery.mockReturnValue({ data: record, isLoading: false, refetch: hooks.refetchRecord });
  hooks.useLedgerRecordsQuery.mockReturnValue({
    data: { data: [record], expend: 20, income: 0, total: 1 },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
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
  it('keeps a company-ledger record visible after clicking it when the detail query is unavailable', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        kind: LedgerKind.CUSTOM,
        name: '公司账本',
        templateKey: 'company',
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerRecordQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: hooks.refetchRecord,
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([
      {
        path: '/ledgers/:ledgerId/records',
        element: createElement(LedgerRecordsPage),
      },
      {
        path: '/ledgers/:ledgerId/records/:recordId',
        element: createElement(LedgerRecordDetailPage),
      },
    ], { initialEntries: ['/ledgers/ledger%2Fa/records'] });
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    await act(async () => {
      container.querySelector<HTMLElement>('[data-record-id="7"]')?.click();
    });

    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records/7');
    expect(container.querySelector('[data-record-detail-presentation]')).not.toBeNull();
    expect(container.textContent).toContain('晚餐');
    expect(container.textContent).not.toContain('records.notFound');
  });

  it('keeps a private default-ledger record reachable so sharing can be restored', async () => {
    const { container, router } = renderPage();

    expect(hooks.useFamilyRecordPolicyQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', recordId: 7 },
      queryOptions: { enabled: true },
    });
    expect(container.querySelector('[data-record-detail-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-detail-header]')?.classList).toContain('bg-primary');
    expect(container.querySelector('[data-record-detail-footer]')).not.toBeNull();
    expect(container.querySelector('.rounded-xl')).toBeNull();
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

  it('disables delete while the mutation is pending', () => {
    hooks.useDeleteLedgerRecordMutation.mockReturnValue([hooks.deleteRecord, { isLoading: true }]);
    const { container } = renderPage();

    expect(container.querySelector<HTMLButtonElement>('[data-testid="ledger-record-delete"]')?.disabled).toBe(true);
  });
});
