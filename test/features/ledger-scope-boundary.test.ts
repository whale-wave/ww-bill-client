import type { Ledger } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LedgerCapability, LedgerKind, LedgerRole, LedgerStatus } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';

const useLedgerQuery = vi.hoisted(() => vi.fn());

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerQuery,
}));

vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const ledger: Ledger = {
  capabilities: [LedgerCapability.RECORD_READ],
  createdAt: '',
  createdByUserId: 1,
  iconKey: 'book',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.VIEWER,
  name: '账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  themeKey: 'cyan',
  updatedAt: '',
  version: 1,
};

let root: ReturnType<typeof createRoot> | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe('ledgerScopeBoundary', () => {
  it('uses the decoded URL ledger id and exposes it to children', () => {
    useLedgerQuery.mockReturnValue({ data: ledger, isError: false, isLoading: false, refetch: vi.fn() });
    const container = document.createElement('div');
    root = createRoot(container);
    act(() => root?.render(createElement(MemoryRouter, { initialEntries: ['/ledgers/ledger%2Fa/records'] }, createElement(Routes, null, createElement(Route, {
      path: '/ledgers/:ledgerId/records',
      element: createElement(LedgerScopeBoundary, {
        capability: LedgerCapability.RECORD_READ,
        children: scope => createElement('span', { 'data-testid': 'scope' }, scope.ledgerId),
      }),
    })))));

    expect(useLedgerQuery).toHaveBeenCalledWith({ params: { ledgerId: 'ledger/a' }, queryOptions: { enabled: true } });
    expect(container.querySelector('[data-testid="scope"]')?.textContent).toBe('ledger/a');
  });

  it('blocks content when the server capability is absent', () => {
    useLedgerQuery.mockReturnValue({ data: { ...ledger, capabilities: [] }, isError: false, isLoading: false, refetch: vi.fn() });
    const container = document.createElement('div');
    root = createRoot(container);
    act(() => root?.render(createElement(MemoryRouter, { initialEntries: ['/ledgers/ledger%2Fa/records'] }, createElement(Routes, null, createElement(Route, {
      path: '/ledgers/:ledgerId/records',
      element: createElement(LedgerScopeBoundary, {
        capability: LedgerCapability.RECORD_READ,
        children: () => createElement('span', null, 'secret'),
      }),
    })))));

    expect(container.textContent).not.toContain('secret');
    expect(container.textContent).toContain('common.noPermission');
  });

  it.each([403, 404])('replaces a deterministically lost ledger with personal detail on %s', (statusCode) => {
    useLedgerQuery.mockReturnValue({
      data: undefined,
      error: Object.assign(new Error('lost access'), { statusCode }),
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = document.createElement('div');
    root = createRoot(container);
    const router = createMemoryRouter([
      {
        path: '/ledgers/:ledgerId/records',
        element: createElement(LedgerScopeBoundary, {
          capability: LedgerCapability.RECORD_READ,
          children: () => createElement('span', null, 'secret'),
        }),
      },
      { path: '/detail', element: createElement('span', null, 'personal-detail') },
    ], { initialEntries: ['/origin', '/ledgers/ledger-a/records'], initialIndex: 1 });

    act(() => root?.render(createElement(RouterProvider, { router })));

    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
    expect(container.textContent).toContain('personal-detail');
  });

  it('keeps a valid ledger in place when only the requested capability is missing', () => {
    useLedgerQuery.mockReturnValue({
      data: { ...ledger, capabilities: [] },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = document.createElement('div');
    root = createRoot(container);
    const router = createMemoryRouter([
      {
        path: '/ledgers/:ledgerId/bill',
        element: createElement(LedgerScopeBoundary, {
          capability: LedgerCapability.RECORD_READ,
          children: () => createElement('span', null, 'secret'),
        }),
      },
      { path: '/detail', element: createElement('span', null, 'personal-detail') },
    ], { initialEntries: ['/ledgers/ledger-a/bill'] });

    act(() => root?.render(createElement(RouterProvider, { router })));

    expect(router.state.location.pathname).toBe('/ledgers/ledger-a/bill');
    expect(container.textContent).toContain('common.noPermission');
    expect(container.textContent).not.toContain('personal-detail');
  });
});
