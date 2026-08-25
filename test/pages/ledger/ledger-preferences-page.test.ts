import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LedgerPreferencesPage from '@/pages/ledger-preferences/LedgerPreferencesPage';
import enLedger from '@/shared/i18n/locales/en/ledger.json';
import zhLedger from '@/shared/i18n/locales/zh-CN/ledger.json';

const hooks = vi.hoisted(() => ({
  patchPreference: vi.fn(),
  refetch: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  usePatchLedgerQuickSwitchMutation: vi.fn(),
}));
const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: hooks.useGetUserAppConfigQuery,
  usePatchLedgerQuickSwitchMutation: hooks.usePatchLedgerQuickSwitchMutation,
}));

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  return { ...actual, Toast: { show: toastShow } };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

function render(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{ path: '/ledgers/preferences', element }], {
    initialEntries: ['/ledgers/preferences'],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return container;
}

function deferred<T>() {
  let reject!: (reason?: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function getSwitch(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[role="switch"]');
}

beforeEach(() => {
  hooks.patchPreference.mockReset();
  hooks.refetch.mockReset();
  hooks.refetch.mockResolvedValue(undefined);
  hooks.useGetUserAppConfigQuery.mockReset();
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: {
      isLedgerQuickSwitchEnabled: false,
      ledgerQuickSwitchVersion: 7,
    },
    isLoading: false,
    refetch: hooks.refetch,
  });
  hooks.usePatchLedgerQuickSwitchMutation.mockReset();
  hooks.usePatchLedgerQuickSwitchMutation.mockReturnValue([
    hooks.patchPreference,
    { isLoading: false },
  ]);
  toastShow.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger preferences page', () => {
  it('provides localized preference and invitation validation copy', () => {
    expect(zhLedger).toMatchObject({
      join: { validation: { codeInvalid: expect.any(String) } },
      preferences: {
        conflict: expect.any(String),
        description: expect.any(String),
        quickSwitch: expect.any(String),
        title: expect.any(String),
        updateFailed: expect.any(String),
      },
    });
    expect(enLedger).toMatchObject({
      join: { validation: { codeInvalid: expect.any(String) } },
      preferences: {
        conflict: expect.any(String),
        description: expect.any(String),
        quickSwitch: expect.any(String),
        title: expect.any(String),
        updateFailed: expect.any(String),
      },
    });
  });

  it('renders the current quick-switch value in the shared preferences shell', () => {
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: {
        isLedgerQuickSwitchEnabled: true,
        ledgerQuickSwitchVersion: 7,
      },
      isLoading: false,
      refetch: hooks.refetch,
    });

    const container = render(createElement(LedgerPreferencesPage));

    expect(container.querySelector('[data-page-header]')).not.toBeNull();
    expect(container.querySelector('main section')?.textContent).toContain('preferences.quickSwitch');
    expect(container.querySelector('.adm-switch')).not.toBeNull();
    expect(container.querySelector('.adm-safe-area-position-bottom')).not.toBeNull();
    expect(getSwitch(container)?.getAttribute('aria-checked')).toBe('true');
  });

  it('submits the current version and keeps loading until the Promise settles', async () => {
    const request = deferred<{
      data: { enabled: boolean; version: number };
    }>();
    hooks.patchPreference.mockReturnValue(request.promise);
    const container = render(createElement(LedgerPreferencesPage));

    await act(async () => {
      getSwitch(container)?.click();
      await Promise.resolve();
    });

    expect(hooks.patchPreference).toHaveBeenCalledWith({ enabled: true, version: 7 });
    expect(getSwitch(container)?.getAttribute('aria-disabled')).toBe('true');

    await act(async () => {
      request.resolve({ data: { enabled: true, version: 8 } });
      await request.promise;
    });

    expect(getSwitch(container)?.getAttribute('aria-checked')).toBe('true');
    expect(getSwitch(container)?.getAttribute('aria-disabled')).toBe('false');
  });

  it('uses the successful cache value and next version for a subsequent update', async () => {
    hooks.patchPreference
      .mockResolvedValueOnce({ data: { enabled: true, version: 8 } })
      .mockResolvedValueOnce({ data: { enabled: false, version: 9 } });
    const container = render(createElement(LedgerPreferencesPage));

    await act(async () => {
      getSwitch(container)?.click();
      await Promise.resolve();
    });
    await act(async () => {
      getSwitch(container)?.click();
      await Promise.resolve();
    });

    expect(hooks.patchPreference).toHaveBeenNthCalledWith(2, {
      enabled: false,
      version: 8,
    });
  });

  it('rolls back an optimistic value when the update fails', async () => {
    hooks.patchPreference.mockRejectedValue(new Error('network failed'));
    const container = render(createElement(LedgerPreferencesPage));

    await act(async () => {
      getSwitch(container)?.click();
      await Promise.resolve();
    });

    expect(getSwitch(container)?.getAttribute('aria-checked')).toBe('false');
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'preferences.updateFailed' }),
    );
  });

  it('refreshes the config and explains a 409 version conflict', async () => {
    hooks.patchPreference.mockRejectedValue(
      Object.assign(new Error('stale'), { statusCode: 409 }),
    );
    const container = render(createElement(LedgerPreferencesPage));

    await act(async () => {
      getSwitch(container)?.click();
      await Promise.resolve();
    });

    expect(hooks.refetch).toHaveBeenCalledTimes(1);
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'preferences.conflict' }),
    );
  });
});
