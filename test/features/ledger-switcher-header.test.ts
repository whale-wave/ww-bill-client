import type { ReactNode } from 'react';
import type { LedgerListItem } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import {
  LedgerTitleSwitcher,
} from '@/features/ledger-switcher';

const hooks = vi.hoisted(() => ({
  refetchLedgers: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  useLedgerNavigationQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useLedgerNavigationQuery: hooks.useLedgerNavigationQuery,
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: hooks.useGetUserAppConfigQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { count?: number }) => ({
      'switcher.create': '创建账本',
      'switcher.currentCustom': '当前账本',
      'switcher.customEmpty': '还没有自定义账本',
      'switcher.loadError': '账本列表加载失败',
      'switcher.loadErrorDescription': '请检查网络后重试',
      'switcher.manage': '账本管理',
      'switcher.memberCount': `${values?.count ?? 0} 人`,
      'switcher.personal': '默认账本',
      'switcher.recordCount': `${values?.count ?? 0} 笔记录`,
      'switcher.retry': '重新加载',
      'switcher.selected': '当前账本',
    })[key] ?? key,
  }),
}));

function createLedger(overrides: Partial<LedgerListItem> = {}): LedgerListItem {
  return {
    activeMemberCount: 1,
    capabilities: [
      LedgerCapability.LEDGER_READ,
      LedgerCapability.RECORD_READ,
      LedgerCapability.RECORD_CREATE,
      LedgerCapability.BUDGET_READ,
      LedgerCapability.CHART_READ,
    ],
    createdAt: '2026-07-22T00:00:00.000Z',
    createdByUserId: 7,
    iconKey: 'wallet',
    id: 'ledger-a',
    kind: LedgerKind.CUSTOM,
    monthStartDay: 1,
    myMembership: { id: 'member-a', sortOrder: 0, version: 1 },
    myRole: LedgerRole.OWNER,
    name: '旅行账本',
    ownerUserId: 7,
    recordCount: 12,
    status: LedgerStatus.ACTIVE,
    themeKey: 'green',
    updatedAt: '2026-07-22T00:00:00.000Z',
    version: 2,
    ...overrides,
  };
}

let cleanup: (() => void) | undefined;

function renderSwitcher(element: ReactNode, pathname = '/detail') {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([{ element, path: '*' }], {
    initialEntries: [pathname],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

async function click(element: Element | null | undefined) {
  expect(element).not.toBeNull();
  await act(async () => {
    (element as HTMLElement).click();
    await Promise.resolve();
  });
}

beforeEach(() => {
  hooks.refetchLedgers.mockReset();
  hooks.useLedgerNavigationQuery.mockReset();
  hooks.useGetUserAppConfigQuery.mockReset();
  hooks.useLedgerNavigationQuery.mockReturnValue({
    data: [
      createLedger({
        id: 'private-default-ledger-id',
        kind: LedgerKind.SYSTEM_DEFAULT,
        name: '系统默认账本',
        recordCount: 126,
      }),
      createLedger(),
    ],
    isError: false,
    isLoading: false,
    refetch: hooks.refetchLedgers,
  });
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: {
      isLedgerQuickSwitchEnabled: true,
      ledgerQuickSwitchVersion: 1,
    },
    isError: false,
    isLoading: false,
  });
});

afterEach(() => {
  const currentCleanup = cleanup;
  cleanup = undefined;
  currentCleanup?.();
  document.body.innerHTML = '';
});

describe('ledger title switcher', () => {
  it('keeps the app title in its existing slot and opens an ID-free default-ledger option', async () => {
    const { container } = renderSwitcher(
      createElement(LedgerTitleSwitcher, { className: 'existing-title-slot' }),
    );
    const title = container.querySelector('[data-testid="ledger-switcher-title"]');

    expect(title?.textContent).toContain('鲸浪账本');
    expect(title?.classList.contains('existing-title-slot')).toBe(true);
    expect(title?.tagName).toBe('BUTTON');
    expect(title?.querySelector('img')).not.toBeNull();

    await click(title);

    const defaultLedger = document.querySelector('[data-testid="ledger-switch-item-personal"]');
    const createAction = document.querySelector<HTMLButtonElement>('[data-ledger-switcher-create]');
    const manageAction = document.querySelector<HTMLButtonElement>('[data-ledger-switcher-manage]');
    expect(defaultLedger?.textContent).toContain('默认账本');
    expect(defaultLedger?.querySelector('img')).not.toBeNull();
    expect(defaultLedger?.textContent).not.toContain('系统默认账本');
    expect(createAction?.classList).toContain('ledger-switcher-panel__footer-action');
    expect(manageAction?.classList).toContain('ledger-switcher-panel__footer-action');
    expect(createAction?.querySelector('svg')).not.toBeNull();
    expect(manageAction?.querySelector('svg')).not.toBeNull();
    expect(document.body.innerHTML).not.toContain('private-default-ledger-id');
  });

  it('renders the original title as static text when quick switching is disabled', () => {
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: {
        isLedgerQuickSwitchEnabled: false,
        ledgerQuickSwitchVersion: 1,
      },
      isError: false,
      isLoading: false,
    });
    const { container } = renderSwitcher(createElement(LedgerTitleSwitcher));
    const title = container.querySelector('[data-testid="ledger-switcher-title"]');

    expect(title?.textContent).toBe('鲸浪账本');
    expect(title?.tagName).toBe('SPAN');
    expect(title?.getAttribute('aria-disabled')).toBe('true');
    expect(title?.querySelector('img')).not.toBeNull();
    expect(title?.querySelector('svg')).toBeNull();
  });

  it('shows the custom ledger name and switches back to the default workspace', async () => {
    const { container, router } = renderSwitcher(
      createElement(LedgerTitleSwitcher, { ledgerName: '旅行账本' }),
      '/ledgers/ledger-a/records',
    );

    const title = container.querySelector('[data-testid="ledger-switcher-title"]');
    expect(title?.textContent).toContain('旅行账本');
    expect(title?.querySelector('svg')).not.toBeNull();
    await click(title);
    await click(document.querySelector('[data-testid="ledger-switch-item-personal"]'));

    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('prevents regression to fixed DesignIcon("ledger") in application source files', () => {
    const modules = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
      eager: true,
      import: 'default',
      query: '?raw',
    });
    const violations: string[] = [];

    for (const [filePath, content] of Object.entries(modules)) {
      if (
        (content.includes('name="ledger"') || content.includes('name=\'ledger\''))
        && !filePath.endsWith('DesignIcon.tsx')
      ) {
        violations.push(filePath);
      }
    }

    expect(violations).toEqual([]);
  });
});
