import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerCapability } from '@/entities/ledger';
import { registerRoutePrefetchers } from '@/shared/lib';
import { LedgerWorkspaceTabBar, TabBar } from '@/widgets/layout';

const hooks = vi.hoisted(() => ({
  prefetched: [] as string[],
  toast: vi.fn(),
}));

vi.mock('antd-mobile', async importOriginal => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Toast: { show: hooks.toast },
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'tabBar.bookkeeping': '记账',
      'tabBar.chart': '图表',
      'tabBar.detail': '明细',
      'tabBar.discovery': '发现',
      'tabBar.mine': '我的',
      'workspace.createDenied': '当前账本没有记账权限',
    })[key] ?? key,
  }),
}));

let cleanup: (() => void) | undefined;

function renderTabBar(element: ReactNode, pathname = '/detail') {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([{ path: '*', element }], {
    initialEntries: [pathname],
  });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

async function click(element: Element | null) {
  expect(element).not.toBeNull();
  await act(async () => {
    (element as HTMLElement).click();
    await Promise.resolve();
  });
}

async function prefetch(element: Element | null) {
  expect(element).not.toBeNull();
  await act(async () => {
    element?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await Promise.resolve();
  });
}

beforeEach(() => {
  hooks.prefetched.length = 0;
  hooks.toast.mockReset();
  registerRoutePrefetchers(Object.fromEntries([
    'personal-detail',
    'personal-chart',
    'personal-bookkeeping',
    'personal-discovery',
    'personal-mine',
    'ledger-records',
    'ledger-create',
    'ledger-charts',
  ].map(key => [key, async () => {
    hooks.prefetched.push(key);
  }])));
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('personal tab bar', () => {
  it('preserves the original five-target DOM, icons, and prominent create action', async () => {
    const { container, router } = renderTabBar(
      createElement(TabBar, { activeKey: 'detail' }),
    );
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-tab-key]'));

    expect(items).toHaveLength(5);
    expect(items.map(item => [item.dataset.tabKey, item.dataset.route])).toEqual([
      ['detail', '/detail'],
      ['chart', '/chart'],
      ['bookkeeping', '/bookkeeping'],
      ['discovery', '/discovery'],
      ['mine', '/mine'],
    ]);
    expect(container.querySelector('.bwm-tab-bar')).not.toBeNull();
    expect(container.querySelector('.ww-personal-tab-bar')).toBeNull();
    expect(container.querySelector('[data-tab-key="bookkeeping"] .h-\\[55px\\]')).not.toBeNull();
    expect(container.querySelectorAll('.bwm-tab-bar > .item')).toHaveLength(5);

    for (const [key, path] of [
      ['chart', '/chart'],
      ['bookkeeping', '/bookkeeping'],
      ['discovery', '/discovery'],
      ['mine', '/mine'],
    ] as const) {
      await click(container.querySelector(`[data-tab-key="${key}"]`));
      expect(router.state.location.pathname).toBe(path);
    }
  });

  it('prefetches the route chunk on pointer intent', async () => {
    const { container } = renderTabBar(createElement(TabBar, { activeKey: 'mine' }));

    await prefetch(container.querySelector('[data-tab-key="detail"]'));
    await vi.waitFor(() => expect(hooks.prefetched).toContain('personal-detail'));
  });
});

describe('custom ledger tab bar', () => {
  it('renders three exact targets, string activeKey, safe area, and prefetch', async () => {
    const { container, router } = renderTabBar(createElement(LedgerWorkspaceTabBar, {
      activeKey: 'records',
      capabilities: [LedgerCapability.RECORD_CREATE],
      ledgerId: 'ledger / a',
    }), '/ledgers/ledger%20%2F%20a/records');
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-tab-key]'));

    expect(items.map(item => [item.dataset.tabKey, item.dataset.route])).toEqual([
      ['records', '/ledgers/ledger%20%2F%20a/records'],
      ['create', '/ledgers/ledger%20%2F%20a/records/new'],
      ['charts', '/ledgers/ledger%20%2F%20a/charts'],
    ]);
    expect(container.querySelector('[data-tab-key="records"]')?.classList)
      .toContain('adm-tab-bar-item-active');
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(container.querySelector('.adm-safe-area-position-bottom')).not.toBeNull();

    await prefetch(container.querySelector('[data-tab-key="records"]'));
    await vi.waitFor(() => expect(hooks.prefetched).toContain('ledger-records'));

    await click(container.querySelector('[data-tab-key="create"]'));
    expect(router.state.location.pathname).toBe('/ledgers/ledger%20%2F%20a/records/new');
    await click(container.querySelector('[data-tab-key="charts"]'));
    expect(router.state.location.pathname).toBe('/ledgers/ledger%20%2F%20a/charts');
  });

  it('blocks create without capability and explains why with Toast', async () => {
    const { container, router } = renderTabBar(createElement(LedgerWorkspaceTabBar, {
      activeKey: 'records',
      capabilities: [],
      ledgerId: 'ledger-a',
    }), '/ledgers/ledger-a/records');
    const createItem = container.querySelector('[data-tab-key="create"]');

    expect(createItem?.getAttribute('aria-disabled')).toBe('true');
    await prefetch(createItem);
    await act(async () => {
      createItem?.querySelector<HTMLElement>('[role="tab"]')?.focus();
    });
    expect(hooks.prefetched).not.toContain('ledger-create');
    await click(createItem);
    expect(router.state.location.pathname).toBe('/ledgers/ledger-a/records');
    expect(hooks.toast).toHaveBeenCalledWith('当前账本没有记账权限');
  });
});
