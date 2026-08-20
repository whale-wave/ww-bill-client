import type { ReactNode } from 'react';
import type { LedgerListItem } from '@/entities/ledger';
import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import LedgerTransferPage from '@/pages/ledger-transfer/LedgerTransferPage';

const hooks = vi.hoisted(() => ({
  executeTransfer: vi.fn(),
  previewTransfer: vi.fn(),
  useExecuteLedgerTransferMutation: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
  useLedgerTagsQuery: vi.fn(),
  useLedgersQuery: vi.fn(),
  usePreviewLedgerTransferMutation: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgersQuery: hooks.useLedgersQuery,
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
}));

vi.mock('@/entities/ledger-data', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger-data')>()),
  useExecuteLedgerTransferMutation: hooks.useExecuteLedgerTransferMutation,
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
  usePreviewLedgerTransferMutation: hooks.usePreviewLedgerTransferMutation,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
}));

vi.mock('@/features/ledger-scope', () => ({
  LedgerScopeBoundary: ({ children }: { children: (scope: { ledgerId: string }) => ReactNode }) =>
    children({ ledgerId: 'target-ledger' }),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

function ledger(
  id: string,
  capabilities: LedgerCapability[],
): LedgerListItem {
  return {
    activeMemberCount: 1,
    capabilities,
    createdAt: '2026-08-01T00:00:00.000Z',
    createdByUserId: 1,
    iconKey: 'wallet',
    id,
    kind: LedgerKind.CUSTOM,
    monthStartDay: 1,
    myMembership: { id: `membership-${id}`, sortOrder: 0, version: 1 },
    myRole: LedgerRole.OWNER,
    name: id,
    ownerUserId: 1,
    recordCount: 1,
    status: LedgerStatus.ACTIVE,
    themeKey: 'ocean',
    updatedAt: '2026-08-01T00:00:00.000Z',
    version: 1,
  };
}

const record: RecordEntry = {
  amount: '20.00',
  category: {
    createdAt: '2026-08-01T00:00:00.000Z',
    icon: 'food',
    id: 1,
    name: 'Food',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  createdAt: '2026-08-20T00:00:00.000Z',
  id: 9,
  remark: 'Lunch',
  tags: [],
  time: '2026-08-20T00:00:00.000Z',
  type: 'sub',
  updatedAt: '2026-08-20T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;
let keySequence = 0;

function query<T>(data: T) {
  return { data, isError: false, isLoading: false, refetch: vi.fn() };
}

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(MemoryRouter, null, createElement(LedgerTransferPage))));
  cleanup = () => act(() => root.unmount());
  return container;
}

function changeSelect(select: HTMLSelectElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  keySequence = 0;
  vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `key-${++keySequence}`) });
  hooks.useLedgersQuery.mockReturnValue(query([
    ledger('target-ledger', [LedgerCapability.DATA_TRANSFER, LedgerCapability.RECORD_READ]),
    ledger('source-ledger', [LedgerCapability.DATA_TRANSFER, LedgerCapability.RECORD_READ]),
    ledger('read-only-ledger', [LedgerCapability.RECORD_READ]),
  ]));
  hooks.useLedgerRecordsQuery.mockReturnValue(query({
    data: [record],
    expend: 20,
    income: 0,
    total: 1,
  }));
  hooks.useLedgerCategoriesQuery.mockReturnValue(query([
    { id: 8, name: 'Meals', type: 'sub' },
    { id: 9, name: 'Dining', type: 'sub' },
  ]));
  hooks.useLedgerTagsQuery.mockReturnValue(query([]));
  hooks.previewTransfer.mockResolvedValue({
    data: {
      conflictCount: 0,
      conflicts: [],
      readyCount: 1,
      requestedCount: 1,
    },
  });
  hooks.usePreviewLedgerTransferMutation.mockReturnValue([hooks.previewTransfer, { isLoading: false }]);
  hooks.useExecuteLedgerTransferMutation.mockReturnValue([hooks.executeTransfer, { isLoading: false }]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
});

describe('ledger transfer page', () => {
  it('selects a readable source ledger while keeping mappings on the current target', () => {
    const container = renderPage();

    expect(hooks.useLedgerRecordsQuery).toHaveBeenLastCalledWith({
      params: { ledgerId: '' },
      queryOptions: { enabled: false },
    });
    expect(hooks.useLedgerCategoriesQuery).toHaveBeenLastCalledWith({
      params: { ledgerId: 'target-ledger' },
    });
    expect(hooks.useLedgerTagsQuery).toHaveBeenLastCalledWith({
      params: { ledgerId: 'target-ledger', status: 'ACTIVE' },
    });
    expect(container.textContent).toContain('transfer.chooseSourceHint');

    const sourceSelect = container.querySelector('select')!;
    expect([...sourceSelect.options].map(option => option.value)).toEqual(['', 'source-ledger']);
    changeSelect(sourceSelect, 'source-ledger');

    expect(hooks.useLedgerRecordsQuery).toHaveBeenLastCalledWith({
      params: { ledgerId: 'source-ledger' },
      queryOptions: { enabled: true },
    });
    expect(container.textContent).not.toContain('transfer.chooseSourceHint');
  });

  it('moves records into the current ledger and renews the key when the payload changes', async () => {
    const container = renderPage();
    changeSelect(container.querySelector('select')!, 'source-ledger');

    await act(async () => {
      container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    });
    changeSelect(container.querySelectorAll('select')[1], '8');

    const previewButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'transfer.preview')!;
    await act(async () => {
      previewButton.click();
      await Promise.resolve();
    });

    const firstRequest = hooks.previewTransfer.mock.calls[0][0];
    expect(firstRequest).toEqual(expect.objectContaining({
      categoryMappings: { 1: 8 },
      recordIds: [9],
      sourceLedgerId: 'source-ledger',
      targetLedgerId: 'target-ledger',
    }));

    changeSelect(container.querySelectorAll('select')[1], '9');
    await act(async () => {
      previewButton.click();
      await Promise.resolve();
    });

    const secondRequest = hooks.previewTransfer.mock.calls[1][0];
    expect(secondRequest.idempotencyKey).not.toBe(firstRequest.idempotencyKey);

    const sourceSelect = container.querySelector('select')!;
    changeSelect(sourceSelect, '');
    expect(container.textContent).not.toContain('transfer.previewSummary');
    changeSelect(sourceSelect, 'source-ledger');
    expect(container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(false);
    expect(container.querySelectorAll('select')).toHaveLength(1);
    expect(previewButton.disabled).toBe(true);
  });
});
