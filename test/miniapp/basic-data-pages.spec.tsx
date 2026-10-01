import type { ComponentType } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const checkIn = vi.hoisted(() => ({ submit: vi.fn(), completed: false }));
beforeEach(() => {
  checkIn.completed = false;
  checkIn.submit.mockReset().mockResolvedValue(undefined);
});

vi.mock('../../miniapp/src/entities/achievement', () => ({
  useAchievementSummary: () => ({ data: { currentTitle: { name: '逐浪者' } } }),
}));
vi.mock('../../miniapp/src/features/check-in', () => ({
  useCheckIn: () => ({ mutateAsync: checkIn.submit, isLoading: false }),
}));

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
      summary: { expense: '32.50', income: '5000', net: '4967.50', averageDailyExpense: '1.08' },
      timeline: [{ key: '2026-10-01', expense: '32.50', income: '5000', net: '4967.50' }, { key: '2026-10-02', expense: '0.00', income: '0', net: '0' }],
    },
    isError: false,
    isLoading: false,
  }),
}));

vi.mock('../../miniapp/src/entities/user', () => ({
  useUserInfo: () => ({
    data: { checkIn: checkIn.completed, email: 'demo@example.test', name: '测试用户', recordCount: 2, username: 'demo' },
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
    expect(page.textContent).toContain('¥4,967.50');
    expect(page.textContent).toContain('餐饮');
    expect(page.textContent).toContain('¥32.50');
    expect(page.textContent).toContain('日均支出¥1.08');
    expect(page.querySelector('.bill-chart-trend')?.getAttribute('src')).toMatch(/^data:image\/svg\+xml,/);
    expect(page.textContent).not.toContain('趋势图暂时无法显示');
    const expenseSource = page.querySelector('.bill-chart-trend')?.getAttribute('src');
    const incomeSwitch = Array.from(page.querySelectorAll('.bill-dashboard-switch button')).find(button => button.textContent === '收入');
    act(() => incomeSwitch?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(incomeSwitch?.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelector('.bill-chart-trend')?.getAttribute('src')).not.toBe(expenseSource);
    expect(page.textContent).toContain('日均: ¥2,500.00');
  });

  it('shows the current bill on discover', () => {
    const page = renderPage(DiscoverPage);
    expect(page.textContent).toContain('账单');
    expect(page.textContent).toContain('¥5000');
    expect(page.textContent).toContain('¥32.5');
  });

  it('shows the user profile and record count', () => {
    const page = renderPage(MinePage);
    expect(page.textContent).toContain('测试用户');
    expect(page.textContent).toContain('逐浪者');
    expect(page.textContent).not.toContain('demo@example.test');
    expect(page.querySelector('.bill-profile-summary__action')?.textContent).toContain('立即打卡');
    expect(page.querySelector('.bill-profile-summary__metrics')?.textContent).toContain('记账总笔数2笔');
  });
  it('shows completed check-in without an active button', () => {
    checkIn.completed = true;
    const page = renderPage(MinePage);
    expect(page.querySelector('.bill-profile-summary__action')?.textContent).toBe('已打卡');
    expect(page.querySelector('.bill-profile-check-in--interactive')).toBeNull();
  });

  it('prevents a second check-in while the first request is unresolved', async () => {
    let complete: (() => void) | undefined;
    checkIn.submit.mockReturnValue(new Promise<void>(resolve => complete = resolve));
    const page = renderPage(MinePage);
    const button = page.querySelector('.bill-profile-check-in');
    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(checkIn.submit).toHaveBeenCalledTimes(1);
    await act(async () => complete?.());
  });

  it('shows a failed check-in and allows retry', async () => {
    checkIn.submit.mockRejectedValueOnce(new Error('打卡失败'));
    const page = renderPage(MinePage);
    const button = page.querySelector('.bill-profile-check-in');
    await act(async () => button?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(page.querySelector('.mine-check-in-error')?.textContent).toBe('打卡失败');
    await act(async () => button?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(checkIn.submit).toHaveBeenCalledTimes(2);
    expect(page.querySelector('.mine-check-in-error')).toBeNull();
  });
});
