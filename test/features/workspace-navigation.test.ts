import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEDGER_ICON_KEYS,
  LedgerCapability,
  LedgerKind,
  LedgerStatus,
} from '@/entities/ledger';
import {
  getWorkspaceHomePath,
  getWorkspaceScope,
  isWorkspaceHomePath,
  shouldUseWorkspaceHistoryBack,
  WorkspaceCapsule,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';

const hooks = vi.hoisted(() => ({
  useLedgerNavigationQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerNavigationQuery: hooks.useLedgerNavigationQuery,
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
}));

let cleanup: (() => void) | undefined;

function renderRoute(element: ReactNode, pathname = '/households/household%2Fa/records/7') {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path: '*' },
    { element: createElement('div', null, 'default-ledger'), path: '/detail' },
  ], { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  hooks.useLedgerNavigationQuery.mockReturnValue({
    data: [{
      activeMemberCount: 3,
      capabilities: [LedgerCapability.LEDGER_READ, LedgerCapability.RECORD_READ],
      id: 'ledger/a',
      kind: LedgerKind.CUSTOM,
      name: '公司账本',
      status: LedgerStatus.ACTIVE,
    }],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useMyHouseholdQuery.mockReturnValue({
    data: {
      id: 'household/a',
      status: 'ACTIVE',
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

describe('workspace navigation', () => {
  it.each([
    ['/detail', { type: 'personal' }],
    ['/search-record?q=lunch', { type: 'personal' }],
    ['/ledgers/ledger%2Fa/records', { ledgerId: 'ledger/a', type: 'custom' }],
    ['/households/household%2Fa/settings', { householdId: 'household/a', type: 'household' }],
  ] as const)('resolves %s to its workspace scope', (pathname, scope) => {
    expect(getWorkspaceScope(pathname)).toEqual(scope);
  });

  it('uses the records home for readable custom ledgers and ledger detail otherwise', () => {
    expect(getWorkspaceHomePath({
      capabilities: [LedgerCapability.RECORD_READ],
      ledgerId: 'ledger/a',
      type: 'custom',
    })).toBe('/ledgers/ledger%2Fa/records');
    expect(getWorkspaceHomePath({
      capabilities: [LedgerCapability.LEDGER_READ],
      ledgerId: 'ledger/a',
      type: 'custom',
    })).toBe('/ledgers/ledger%2Fa');
  });

  it('treats both household home aliases as the same workspace home', () => {
    const scope = { householdId: 'household/a', type: 'household' } as const;
    expect(isWorkspaceHomePath('/households/household%2Fa', scope)).toBe(true);
    expect(isWorkspaceHomePath('/households/household%2Fa/records', scope)).toBe(true);
  });

  it('uses history only when the page was reached inside the app', () => {
    expect(shouldUseWorkspaceHistoryBack({ historyIndex: 2, locationKey: 'route-key' })).toBe(true);
    expect(shouldUseWorkspaceHistoryBack({ historyIndex: 0, locationKey: 'default' })).toBe(false);
    expect(shouldUseWorkspaceHistoryBack({ historyIndex: 0, locationKey: 'route-key' })).toBe(false);
    expect(shouldUseWorkspaceHistoryBack({ locationKey: 'route-key' })).toBe(true);
  });

  it('uses the solid-dot action to return to the default ledger', async () => {
    const { container, router } = renderRoute(createElement(WorkspaceCapsule, {
      scope: { householdId: 'household/a', type: 'household' },
    }));

    const returnButton = container.querySelector<HTMLButtonElement>(
      '[data-workspace-capsule] button[aria-label="返回默认账本"]',
    );
    expect(returnButton).not.toBeNull();
    expect(returnButton?.disabled).toBe(false);
    expect(returnButton?.querySelector('[data-workspace-home-icon]')?.tagName).toBe('SPAN');

    await act(async () => returnButton?.click());
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('keeps the capsule opt-in instead of adding it to every navigation header', () => {
    const { container } = renderRoute(createElement(WorkspaceNavHeader, {
      onBack: vi.fn(),
      title: '设置',
    }));

    expect(container.querySelector('[data-workspace-capsule]')).toBeNull();
    expect(container.querySelector('button[aria-label="返回"]')).not.toBeNull();
  });

  it('separates personal and custom ledgers from the household ledger', async () => {
    const { container } = renderRoute(createElement(WorkspaceCapsule, {
      scope: { householdId: 'household/a', type: 'household' },
    }));

    await act(async () => container.querySelector<HTMLButtonElement>(
      '[data-workspace-capsule] button[aria-label="切换账本"]',
    )?.click());

    const myLedgers = document.body.querySelector('[data-workspace-section="my-ledgers"]');
    const householdLedger = document.body.querySelector('[data-workspace-section="household-ledger"]');
    const panel = document.body.querySelector('.ledger-switcher-panel');
    const companyOption = document.body.querySelector('[data-workspace-option="custom-ledger/a"]');
    expect(myLedgers?.textContent).toContain('默认账本');
    expect(myLedgers?.textContent).toContain('公司账本');
    expect(myLedgers?.textContent).not.toContain('家庭账本');
    expect(householdLedger?.textContent).toContain('家庭账本');
    expect(householdLedger?.textContent).not.toContain('公司账本');
    expect(panel).not.toBeNull();
    expect(companyOption?.classList).toContain('ledger-switcher-panel__option');
    expect(document.body.querySelectorAll('.ledger-switcher-panel__footer-action')).toHaveLength(2);
  });

  it('renders every custom ledger glyph and keeps the household Users icon in the selector', async () => {
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: LEDGER_ICON_KEYS.map((iconKey, index) => ({
        activeMemberCount: index + 1,
        capabilities: [LedgerCapability.LEDGER_READ, LedgerCapability.RECORD_READ],
        iconKey,
        id: `ledger/${iconKey}`,
        kind: LedgerKind.CUSTOM,
        name: iconKey,
        status: LedgerStatus.ACTIVE,
      })),
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const { container } = renderRoute(createElement(WorkspaceCapsule, {
      scope: { householdId: 'household/a', type: 'household' },
    }));

    await act(async () => container.querySelector<HTMLButtonElement>(
      '[data-workspace-capsule] button[aria-label="切换账本"]',
    )?.click());

    for (const iconKey of LEDGER_ICON_KEYS) {
      const option = document.body.querySelector(`[data-workspace-option="custom-ledger/${iconKey}"]`);
      expect(option?.querySelector('svg')).not.toBeNull();
      expect(option?.querySelector('img')).toBeNull();
    }

    const householdOption = document.body.querySelector('[data-workspace-option="household-household/a"]');
    expect(householdOption?.querySelector('svg')?.classList).toContain('lucide-users');
    expect(householdOption?.querySelector('img')).toBeNull();
  });
});
