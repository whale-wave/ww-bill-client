import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerRecordType } from '@/entities/ledger';
import { LedgerRecordForm } from '@/features/ledger-record-form';

const hooks = vi.hoisted(() => ({
  createRecord: vi.fn(),
  updateRecord: vi.fn(),
  useCreateLedgerRecordMutation: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  useLedgerTagsQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useUpdateLedgerRecordMutation: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
}));

vi.mock('@/entities/category', () => ({
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
}));

vi.mock('@/entities/ledger-data', () => ({
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useCreateLedgerRecordMutation: hooks.useCreateLedgerRecordMutation,
  useUpdateLedgerRecordMutation: hooks.useUpdateLedgerRecordMutation,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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
  ledgerId: 'ledger/a',
  remark: '晚餐',
  tags: [],
  time: '2026-07-21T12:00:00.000Z',
  type: 'sub',
  updatedAt: '2026-07-21T12:00:00.000Z',
  version: 4,
};

let cleanup: (() => void) | undefined;

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useLedgerCategoriesQuery.mockReturnValue({ data: [record.category] });
  hooks.useLedgerTagsQuery.mockReturnValue({ data: [] });
  hooks.useLedgerPreferencesQuery.mockReturnValue({
    data: { defaultRecordType: LedgerRecordType.EXPENSE },
    isLoading: false,
  });
  hooks.useCreateLedgerRecordMutation.mockReturnValue([hooks.createRecord, { isLoading: false }]);
  hooks.useUpdateLedgerRecordMutation.mockReturnValue([hooks.updateRecord, { isLoading: false }]);
  hooks.updateRecord.mockResolvedValue({ statusCode: 200 });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger record form concurrency contract', () => {
  it('uses the member preference as the initial type for a new record', async () => {
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { defaultRecordType: LedgerRecordType.INCOME },
      isLoading: false,
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(LedgerRecordForm, {
      ledgerId: 'ledger/a',
      onSaved: vi.fn(),
    })));
    cleanup = () => act(() => root.unmount());

    await act(async () => Promise.resolve());

    expect(hooks.useLedgerCategoriesQuery).toHaveBeenLastCalledWith({
      params: { ledgerId: 'ledger/a', type: LedgerRecordType.INCOME },
    });
  });

  it('submits the loaded optimistic version when editing', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onSaved = vi.fn();
    act(() => root.render(createElement(LedgerRecordForm, {
      initialRecord: record,
      ledgerId: 'ledger/a',
      onSaved,
    })));
    cleanup = () => act(() => root.unmount());

    await act(async () => {
      container.querySelector('form')?.dispatchEvent(new Event('submit', {
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(hooks.updateRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: '20.00',
        categoryId: 1,
        remark: '晚餐',
        type: 'sub',
        version: 4,
      }),
      ledgerId: 'ledger/a',
      recordId: '7',
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
