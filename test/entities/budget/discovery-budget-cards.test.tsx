import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetEntityType } from '@/entities/budget';
import CurMonthBudgetCard, { CurrentBudgetSummaryCardPresentation } from '@/entities/budget/ui/CurMonthBudgetCard';

const hooks = vi.hoisted(() => ({
  getBudgetInfo: vi.fn(),
}));

vi.mock('@/entities/budget/hooks', () => ({
  useGetBudgetInfoQuery: hooks.getBudgetInfo,
}));

let cleanup: (() => void) | undefined;

function renderCard(element: ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path: '/discover' },
    { element: createElement('div', null, 'budget-page'), path: '/budget' },
  ], { initialEntries: ['/discover'] });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

function queryData(summaryBudget?: { id: string; budgetAmount: number; amount: number; remaining: number; remainingPercentage: string }) {
  return {
    data: { categoryBudgets: [], summaryBudget },
    isLoading: false,
  };
}

beforeEach(() => {
  hooks.getBudgetInfo.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('discovery budget cards', () => {
  it('only renders cards for budget periods that have been configured', () => {
    hooks.getBudgetInfo.mockImplementation(({ params: { type } }) => {
      if (type === BudgetEntityType.MONTH)
        return queryData({ amount: 300, budgetAmount: 1200, id: 'month-budget', remaining: 900, remainingPercentage: '75' });
      if (type === BudgetEntityType.YEAR)
        return queryData({ amount: 2400, budgetAmount: 18000, id: 'year-budget', remaining: 15600, remainingPercentage: '86.67' });
      return queryData();
    });

    const { container } = renderCard(createElement(CurMonthBudgetCard));

    expect(hooks.getBudgetInfo).toHaveBeenCalledWith({ params: { type: BudgetEntityType.DAY } });
    expect(hooks.getBudgetInfo).toHaveBeenCalledWith({ params: { type: BudgetEntityType.MONTH } });
    expect(hooks.getBudgetInfo).toHaveBeenCalledWith({ params: { type: BudgetEntityType.YEAR } });
    expect(container.querySelectorAll('.ww-current-budget-card')).toHaveLength(2);
    expect(container.querySelector('[data-discovery-budget-card-list]')?.className).toContain('space-y-[14px]');
    expect(container.textContent).toContain('月预算总览');
    expect(container.textContent).toContain('年预算总览');
    expect(container.textContent).not.toContain('日预算总览');
  });

  it('replaces empty zero-value data with an add-budget prompt', async () => {
    hooks.getBudgetInfo.mockReturnValue(queryData());
    const { container, router } = renderCard(createElement(CurMonthBudgetCard));

    expect(container.textContent).toContain('还未设置预算');
    expect(container.textContent).toContain('添加日、月或年预算');
    expect(container.textContent).not.toContain('¥0.00');

    await act(async () => container.querySelector<HTMLButtonElement>('[data-discovery-add-budget]')?.click());
    expect(router.state.location.pathname).toBe('/budget');
  });

  it('keeps an over-budget progress bar visible and marks it as exceeded', () => {
    const { container } = renderCard(createElement(CurrentBudgetSummaryCardPresentation, {
      data: { amount: 8872.68, budgetAmount: 4000, id: 'over-budget', remaining: -4872.68, remainingPercentage: '0' },
      title: '09月预算总览',
    }));

    const progress = container.querySelector<HTMLElement>('[data-budget-progress]');
    expect(container.textContent).toContain('已超支');
    expect(progress?.getAttribute('aria-valuenow')).toBe('100');
    expect(progress?.firstElementChild?.className).toContain('bg-finance-expense');
    expect((progress?.firstElementChild as HTMLElement | null)?.style.width).toBe('100%');
  });
});
