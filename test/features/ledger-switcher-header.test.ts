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
  LedgerSwitcherHeader,
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
      'switcher.cancel': '取消',
      'switcher.create': '创建账本',
      'switcher.currentPersonal': '当前为个人账本',
      'switcher.currentCustom': '当前账本',
      'switcher.currentSettings': '当前账本设置',
      'switcher.customEmpty': '还没有自定义账本',
      'switcher.loadError': '账本列表加载失败',
      'switcher.loadErrorDescription': '请检查网络后重试',
      'switcher.manage': '账本管理',
      'switcher.memberCount': `${values?.count ?? 0} 人`,
      'switcher.more': '更多账本操作',
      'switcher.personal': '个人账本',
      'switcher.preferences': '快捷入口设置',
      'switcher.recordCount': `${values?.count ?? 0} 笔记录`,
      'switcher.retry': '重新加载',
      'switcher.returnPersonal': '返回个人账本',
      'switcher.switch': '切换账本',
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

interface RenderHeaderOptions {
  element?: ReactNode;
  pathname?: string;
}

let cleanup: (() => void) | undefined;

function cleanupCurrentRender() {
  const currentCleanup = cleanup;
  cleanup = undefined;
  currentCleanup?.();
}

function renderHeader(options: RenderHeaderOptions = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([{
    path: '*',
    element: options.element ?? createElement(LedgerSwitcherHeader),
  }], { initialEntries: [options.pathname ?? '/detail'] });

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

function getAction(text: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('.adm-action-sheet-button-item'))
    .find(element => element.textContent?.trim() === text);
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
      createLedger({
        activeMemberCount: 2,
        id: 'ledger-b',
        name: '共享账本',
      }),
    ],
    isError: false,
    isLoading: false,
    refetch: hooks.refetchLedgers,
  });
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: {
      isLedgerQuickSwitchEnabled: false,
      ledgerQuickSwitchVersion: 1,
    },
    isError: false,
    isLoading: false,
  });
});

afterEach(() => {
  cleanupCurrentRender();
  document.body.innerHTML = '';
});

describe('ledger switcher header', () => {
  it('renders a static title when quick switch is off and keeps ordinary actions', async () => {
    const { container } = renderHeader();
    const title = container.querySelector('[data-testid="ledger-switcher-title"]');

    expect(title?.textContent).toBe('个人账本');
    expect(title?.querySelector('svg')).toBeNull();
    expect(title?.getAttribute('aria-disabled')).toBe('true');
    expect(container.querySelector('[data-testid="mini-program-capsule"]')).not.toBeNull();
    expect(container.querySelector('.adm-safe-area-position-top')).not.toBeNull();

    await click(container.querySelector('[data-testid="ledger-capsule-more"]'));

    expect(getAction('切换账本')).toBeUndefined();
    expect(getAction('创建账本')).toBeDefined();
    expect(getAction('账本管理')).toBeDefined();
    expect(getAction('快捷入口设置')).toBeDefined();
    expect(getAction('创建账本')?.getAttribute('tabindex')).toBe('0');
    expect(document.querySelector('.adm-action-sheet')?.getAttribute('role')).toBe('dialog');
    expect(document.querySelector('.adm-action-sheet')?.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('.adm-action-sheet-button-list')?.getAttribute('role')).toBe('menu');
    expect(getAction('创建账本')?.getAttribute('role')).toBe('menuitem');
  });

  it('opens an ordered, ID-free switch panel and marks the selected item', async () => {
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: { isLedgerQuickSwitchEnabled: true, ledgerQuickSwitchVersion: 1 },
      isError: false,
      isLoading: false,
    });
    const { container } = renderHeader({ pathname: '/ledgers/ledger-a/records' });

    expect(container.querySelector('[data-testid="ledger-switcher-title"]')?.textContent)
      .toContain('旅行账本');
    expect(container.querySelector('[data-testid="ledger-switcher-title"] svg')).not.toBeNull();

    await click(container.querySelector('[data-testid="ledger-switcher-title"]'));

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    const personal = document.querySelector('[data-testid="ledger-switch-item-personal"]');
    const custom = document.querySelector('[data-ledger-switcher-id="ledger-a"]');
    const shared = document.querySelector('[data-ledger-switcher-id="ledger-b"]');
    expect(document.activeElement).toBe(personal);
    expect(personal?.textContent).toContain('个人账本');
    expect(personal?.textContent).toContain('126 笔记录');
    expect(custom?.textContent).toContain('旅行账本');
    expect(custom?.textContent).not.toContain('12 笔记录');
    expect(shared?.textContent).toContain('2 人');
    expect(custom?.getAttribute('data-selected')).toBe('true');
    expect(custom?.querySelector('.ledger-switcher-panel__check')).not.toBeNull();
    expect(personal?.querySelector('.ledger-switcher-panel__check')).toBeNull();
    expect(document.body.textContent).not.toContain('系统默认账本');
    expect(document.body.innerHTML).not.toContain('private-default-ledger-id');
    expect(personal!.compareDocumentPosition(custom!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();

    await click(custom);
    await click(container.querySelector('[data-testid="ledger-capsule-more"]'));
    expect(getAction('切换账本')).toBeDefined();
    await click(getAction('切换账本'));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('never labels a cold custom URL as the personal workspace', () => {
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: true,
      refetch: hooks.refetchLedgers,
    });

    const { container } = renderHeader({ pathname: '/ledgers/cold-ledger/records' });

    expect(container.querySelector('[data-testid="ledger-switcher-title"]')?.textContent)
      .toBe('当前账本');
    expect(container.querySelector('[data-testid="ledger-switcher-title"]')?.textContent)
      .not
      .toBe('个人账本');
  });

  it('switches ledger and circle targets with replace navigation', async () => {
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: { isLedgerQuickSwitchEnabled: true, ledgerQuickSwitchVersion: 1 },
      isError: false,
      isLoading: false,
    });
    const { container, router } = renderHeader({ pathname: '/ledgers/ledger-a/charts' });

    await click(container.querySelector('[data-testid="ledger-switcher-title"]'));
    await click(document.querySelector('[data-testid="ledger-switch-item-personal"]'));
    expect(router.state.location.pathname).toBe('/chart');
    expect(router.state.historyAction).toBe('REPLACE');

    await act(async () => {
      await router.navigate('/ledgers/ledger-a/records');
    });
    await click(container.querySelector('[data-testid="ledger-capsule-personal"]'));
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('keeps the personal circle current without navigating again', async () => {
    const { container, router } = renderHeader();
    const circle = container.querySelector('[data-testid="ledger-capsule-personal"]');

    expect(circle?.getAttribute('aria-current')).toBe('page');
    await click(circle);
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('POP');
  });

  it('puts page actions first and preserves exact search/calendar URLs', async () => {
    const element = createElement(LedgerSwitcherHeader, {
      leadingActions: [
        { key: 'search', path: '/search-record', text: '搜索' },
        {
          key: 'calendar',
          path: '/record-calendar?selectTime=1784659200000',
          text: '日历',
        },
      ],
    });
    const { container, router } = renderHeader({ element });

    await click(container.querySelector('[data-testid="ledger-capsule-more"]'));
    const actions = Array.from(document.querySelectorAll<HTMLElement>(
      '.adm-action-sheet-button-list .adm-action-sheet-button-item',
    ));
    expect(actions.slice(0, 2).map(action => action.textContent?.trim()))
      .toEqual(['搜索', '日历']);

    await click(getAction('搜索'));
    expect(router.state.location.pathname).toBe('/search-record');

    await click(container.querySelector('[data-testid="ledger-capsule-more"]'));
    await click(getAction('日历'));
    expect(router.state.location.pathname).toBe('/record-calendar');
    expect(router.state.location.search).toBe('?selectTime=1784659200000');
  });

  it('shows current settings only when the current custom item is readable', async () => {
    const { container } = renderHeader({ pathname: '/ledgers/ledger-a/records' });

    await click(container.querySelector('[data-testid="ledger-capsule-more"]'));
    expect(getAction('当前账本设置')).toBeDefined();

    cleanupCurrentRender();
    document.body.innerHTML = '';
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: [createLedger({ capabilities: [] })],
      isError: false,
      isLoading: false,
      refetch: hooks.refetchLedgers,
    });
    const second = renderHeader({ pathname: '/ledgers/ledger-a/records' });
    await click(second.container.querySelector('[data-testid="ledger-capsule-more"]'));
    expect(getAction('当前账本设置')).toBeUndefined();
  });

  it('renders panel loading, error/retry, and personal-only states', async () => {
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: { isLedgerQuickSwitchEnabled: true, ledgerQuickSwitchVersion: 1 },
      isError: false,
      isLoading: false,
    });
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: true,
      refetch: hooks.refetchLedgers,
    });
    const loading = renderHeader();
    await click(loading.container.querySelector('[data-testid="ledger-switcher-title"]'));
    expect(document.querySelector('.adm-spin-loading')).not.toBeNull();

    cleanupCurrentRender();
    document.body.innerHTML = '';
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: [],
      isError: true,
      isLoading: false,
      refetch: hooks.refetchLedgers,
    });
    const error = renderHeader();
    await click(error.container.querySelector('[data-testid="ledger-switcher-title"]'));
    expect(document.body.textContent).toContain('账本列表加载失败');
    await click(Array.from(document.querySelectorAll('button'))
      .find(button => button.textContent === '重新加载'));
    expect(hooks.refetchLedgers).toHaveBeenCalledTimes(1);

    cleanupCurrentRender();
    document.body.innerHTML = '';
    hooks.useLedgerNavigationQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
      refetch: hooks.refetchLedgers,
    });
    const empty = renderHeader();
    await click(empty.container.querySelector('[data-testid="ledger-switcher-title"]'));
    expect(document.querySelector('[data-testid="ledger-switch-item-personal"]')).not.toBeNull();
    expect(document.body.textContent).toContain('还没有自定义账本');
    expect(document.body.textContent).toContain('创建账本');
    expect(document.body.textContent).toContain('账本管理');
  });
});
