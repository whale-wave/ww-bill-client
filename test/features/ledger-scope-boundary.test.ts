import type { Ledger } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
});
