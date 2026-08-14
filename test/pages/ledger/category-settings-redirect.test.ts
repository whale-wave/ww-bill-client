import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerKind } from '@/entities/ledger';
import CategorySettingsPage from '@/pages/category-settings/CategorySettingsPage';

const useLedgersQuery = vi.hoisted(() => vi.fn());

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgersQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

beforeEach(() => useLedgersQuery.mockReset());
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('personal category settings redirect', () => {
  it('replaces the placeholder route with the default ledger category manager', async () => {
    useLedgersQuery.mockReturnValue({
      data: [{ id: 'ledger/a', kind: LedgerKind.SYSTEM_DEFAULT }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([
      { element: createElement(CategorySettingsPage), path: '/category' },
      { element: createElement('div', null, 'unified-category-manager'), path: '/ledgers/:ledgerId/settings/categories' },
    ], { initialEntries: ['/settings', '/category'], initialIndex: 1 });
    await act(async () => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/settings/categories');
    expect(router.state.historyAction).toBe('REPLACE');
    await act(async () => router.navigate(-1));
    expect(router.state.location.pathname).toBe('/settings');
  });
});
