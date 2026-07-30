import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerCapability, LedgerRecordType } from '@/entities/ledger';
import LedgerRecordCreatePage from '@/pages/ledger-record-create/LedgerRecordCreatePage';
import LedgerRecordEditPage from '@/pages/ledger-record-edit/LedgerRecordEditPage';

const hooks = vi.hoisted(() => ({
  createRecord: vi.fn(),
  updateRecord: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerRecordQuery: vi.fn(),
  useLedgerTagsQuery: vi.fn(),
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
}));

vi.mock('@/entities/ledger-data', () => ({
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useCreateLedgerRecordMutation: () => [hooks.createRecord, { isLoading: false }],
  useLedgerRecordQuery: hooks.useLedgerRecordQuery,
  useUpdateLedgerRecordMutation: () => [hooks.updateRecord, { isLoading: false }],
}));

vi.mock('@/features/ledger-scope', () => ({
  LedgerScopeBoundary: ({ children }: {
    children: (scope: {
      ledger: { capabilities: LedgerCapability[] };
      ledgerId: string;
    }) => unknown;
  }) => children({
    ledger: {
      capabilities: [
        LedgerCapability.RECORD_CREATE,
        LedgerCapability.RECORD_UPDATE,
        LedgerCapability.TAG_READ,
      ],
    },
    ledgerId: 'ledger/a',
  }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  Icon: ({ name }: { name: string }) => createElement('span', { 'data-icon': name }),
}));

let cleanup: (() => void) | undefined;

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.createRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
  hooks.updateRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
  hooks.useLedgerPreferencesQuery.mockReturnValue({
    data: { defaultRecordType: LedgerRecordType.INCOME },
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerCategoriesQuery.mockReturnValue({
    data: [{
      createdAt: '',
      icon: 'salary',
      id: 2,
      ledgerId: 'ledger/a',
      name: '工资',
      type: 'add',
      updatedAt: '',
    }],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useLedgerTagsQuery.mockReturnValue({
    data: [{ id: 'tag-a', name: '固定收入' }],
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerRecordQuery.mockReturnValue({
    data: {
      amount: '20.00',
      category: {
        createdAt: '',
        icon: 'salary',
        id: 2,
        name: '工资',
        updatedAt: '',
      },
      createdAt: '',
      id: 7,
      ledgerId: 'ledger/a',
      remark: '七月工资',
      tags: [{ id: 'tag-a', name: '固定收入' }],
      time: '2026-07-22T12:00:00.000Z',
      type: 'add',
      updatedAt: '',
      version: 4,
    },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('custom ledger record editor adapter', () => {
  it('uses preference, scoped data, tags and calendar return without changing the presentation', async () => {
    const selectTime = new Date('2026-07-22T12:00:00.000Z').valueOf();
    const router = createMemoryRouter([
      {
        path: '/ledgers/:ledgerId/records/new',
        element: createElement(LedgerRecordCreatePage),
      },
      {
        path: '/ledgers/:ledgerId/calendar',
        element: createElement('div', null, 'calendar'),
      },
    ], {
      initialEntries: [`/ledgers/ledger%2Fa/records/new?selectTime=${selectTime}`],
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-editor-presentation]')).not.toBeNull();
    expect(hooks.useLedgerCategoriesQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      params: { ledgerId: 'ledger/a', type: LedgerRecordType.INCOME },
    }));

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="2"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    await act(async () => Promise.resolve());
    act(() => [...document.body.querySelectorAll('button')].find(button => button.textContent === '固定收入')?.click());
    act(() => [...container.querySelectorAll('button')].find(button => button.textContent === '1')?.click());
    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.createRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: '1',
        categoryId: 2,
        tagIds: ['tag-a'],
        time: new Date(selectTime).toISOString(),
        type: 'add',
      }),
      ledgerId: 'ledger/a',
    });
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/calendar');
    expect(router.state.location.search).toBe(`?selectTime=${selectTime}`);
  });

  it('uses the same editor for updates and keeps the loaded optimistic version', async () => {
    const router = createMemoryRouter([
      {
        path: '/ledgers/:ledgerId/records/:recordId/edit',
        element: createElement(LedgerRecordEditPage),
      },
      {
        path: '/ledgers/:ledgerId/records/:recordId',
        element: createElement('div', null, 'detail'),
      },
    ], {
      initialEntries: ['/ledgers/ledger%2Fa/records/7/edit'],
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-editor-presentation]')).not.toBeNull();
    await act(async () => {
      [...container.querySelectorAll('button')].find(button => button.textContent === '完成')?.click();
      await Promise.resolve();
    });

    expect(hooks.updateRecord).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: '20',
        categoryId: 2,
        tagIds: ['tag-a'],
        version: 4,
      }),
      ledgerId: 'ledger/a',
      recordId: '7',
    });
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records/7');
  });
});
