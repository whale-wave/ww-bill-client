import type { ComponentType } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../miniapp/src/features/auth', () => ({
  useAuthGate: () => true,
  useAuthStore: { getState: () => ({ logOut: vi.fn() }) },
}));

vi.mock('../../miniapp/src/entities/record', () => ({
  useMonthRecords: () => ({
    data: {
      pages: [{
        data: [
          { id: 1, amount: '32.50', category: { id: 1, icon: 'food', name: '午餐', path: '餐饮 / 午餐' }, remark: '便当', time: '2026-10-01T04:00:00.000Z', type: 'sub' },
          { id: 2, amount: '5000', category: { id: 2, icon: 'salary', name: '工资' }, remark: '', time: '2026-10-01T04:00:00.000Z', type: 'add' },
        ],
        expend: 32.5,
        income: 5000,
        total: 2,
      }],
    },
    hasNextPage: false,
    isError: false,
    isLoading: false,
  }),
}));

vi.mock('../../miniapp/src/entities/chart', () => ({
  useMonthChart: () => ({
    data: {
      categories: [{ amount: '32.50', key: 'food', name: '餐饮' }],
      summary: { expense: '32.50', income: '5000', net: '4967.50' },
    },
    isError: false,
    isLoading: false,
  }),
}));

vi.mock('../../miniapp/src/entities/user', () => ({
  useUserInfo: () => ({
    data: { email: 'demo@example.test', name: '测试用户', recordCount: 2, username: 'demo' },
    isError: false,
    isLoading: false,
  }),
}));

let cleanup: (() => void) | undefined;
let ChartPage: ComponentType;
let DiscoverPage: ComponentType;
let RecordsPage: ComponentType;
let MinePage: ComponentType;

beforeAll(async () => {
  process.env.TARO_PLATFORM = 'web';
  [
    { default: ChartPage },
    { default: DiscoverPage },
    { default: RecordsPage },
    { default: MinePage },
  ] = await Promise.all([
    import('../../miniapp/src/pages/chart/index'),
    import('../../miniapp/src/pages/discover/index'),
    import('../../miniapp/src/pages/index/index'),
    import('../../miniapp/src/pages/mine/index'),
  ]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function renderPage(Page: ComponentType) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(Page)));
  cleanup = () => act(() => root.unmount());
  return container;
}

describe('miniapp basic data pages', () => {
  it('shows record totals and category paths', () => {
    const page = renderPage(RecordsPage);
    expect(page.textContent).toContain('收入¥5000.00');
    expect(page.textContent).toContain('支出¥32.50');
    expect(page.textContent).toContain('餐饮 / 午餐');
    expect(page.textContent).toContain('便当');
  });

  it('shows the chart summary and expense category', () => {
    const page = renderPage(ChartPage);
    expect(page.textContent).toContain('¥4967.50');
    expect(page.textContent).toContain('餐饮');
    expect(page.textContent).toContain('¥32.50');
  });

  it('shows the current bill on discover', () => {
    const page = renderPage(DiscoverPage);
    expect(page.textContent).toContain('本月账单');
    expect(page.textContent).toContain('¥5000.00');
    expect(page.textContent).toContain('¥32.50');
  });

  it('shows the user profile and record count', () => {
    const page = renderPage(MinePage);
    expect(page.textContent).toContain('测试用户');
    expect(page.textContent).toContain('demo@example.test');
    expect(page.textContent).toContain('2 笔');
  });
});
