import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionSheet } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetEntityType } from '@/entities/budget';
import BudgetPage from '@/pages/budget/BudgetPage';

const hooks = vi.hoisted(() => ({
  deleteCategory: vi.fn(),
  getBudgetInfo: vi.fn(),
  postClear: vi.fn(),
}));

vi.mock('@/entities/budget', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/budget')>()),
  useDeleteBudgetCategoryByBudgetIdMutation: () => [hooks.deleteCategory, {}],
  useGetBudgetInfoQuery: hooks.getBudgetInfo,
  usePostBudgetClearMutation: () => [hooks.postClear, {}],
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: { setOption: vi.fn() } }),
}));

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const queryClient = new QueryClient();
  const router = createMemoryRouter([
    { element, path: '/budget' },
    { element: createElement('div', null, 'category-target'), path: '/budget/category/:type' },
  ], { initialEntries: [pathname] });
  act(() => root.render(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(RouterProvider, { router }),
  )));
  cleanup = () => {
    act(() => root.unmount());
    queryClient.clear();
  };
  return { container, router };
}

beforeEach(() => {
  hooks.getBudgetInfo.mockReset();
  hooks.getBudgetInfo.mockReturnValue({
    data: {
      categoryBudgets: [],
      summaryBudget: {
        amount: 100,
        budgetAmount: 1000,
        id: 'summary-1',
        remaining: 900,
        remainingPercentage: '90',
      },
    },
    isLoading: false,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
});

describe('personal budget page presentation', () => {
  it('keeps the URL-seeded context dropdown and category navigation defaults', async () => {
    hooks.getBudgetInfo.mockReturnValue({
      data: {
        categoryBudgets: [{
          amount: 20,
          budgetAmount: 100,
          category: {
            createdAt: '2026-07-01T00:00:00.000Z',
            icon: 'food',
            id: 1,
            name: 'Dining',
            type: 'sub',
            updatedAt: '2026-07-01T00:00:00.000Z',
          },
          id: 'category-1',
          remaining: 80,
          remainingPercentage: '80',
        }],
        summaryBudget: {
          amount: 100,
          budgetAmount: 1000,
          id: 'summary-1',
          remaining: 900,
          remainingPercentage: '90',
        },
      },
      isLoading: false,
    });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    const { container, router } = renderPage('/budget?type=1', createElement(BudgetPage));

    expect(container.querySelector('[data-budget-page-shell]')).not.toBeNull();
    expect(hooks.getBudgetInfo).toHaveBeenLastCalledWith({
      params: { type: BudgetEntityType.YEAR },
    });
    expect(container.querySelector('.adm-dropdown-item-title')?.textContent).toContain('dropdown.yearlyBudget');
    expect(container.querySelector('[data-budget-id="summary-1"]')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="category-1"]')?.textContent).toContain('Dining');
    expect(container.querySelector('[data-budget-add-category]')?.closest('.fixed')).not.toBeNull();

    act(() => container.querySelector<HTMLElement>('[data-budget-id="summary-1"]')?.click());
    expect(actionSheet.mock.calls[0]?.[0].actions.some(action => action.key === 'edit')).toBe(true);
    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-1"]')?.click());
    expect(actionSheet.mock.calls[1]?.[0].actions.some(action => action.key === 'edit')).toBe(true);

    await act(async () => container.querySelector<HTMLElement>('.adm-dropdown-item-title')?.click());
    await act(async () => container.querySelector<HTMLElement>('[data-budget-type="0"]')?.click());
    expect(hooks.getBudgetInfo).toHaveBeenLastCalledWith({
      params: { type: BudgetEntityType.MONTH },
    });

    await act(async () => container.querySelector<HTMLElement>('[data-budget-add-category]')?.click());
    expect(router.state.location.pathname).toBe('/budget/category/0');
  });

  it('keeps the personal summary empty-state create action', () => {
    hooks.getBudgetInfo.mockReturnValue({ data: {}, isLoading: false });
    const { container } = renderPage('/budget', createElement(BudgetPage));

    expect(container.textContent).toContain('emptyBudget');
    expect(container.querySelector('[data-budget-add-category]')).toBeNull();
    act(() => container.querySelector<HTMLElement>('[data-budget-create-summary]')?.click());
    expect(container.querySelector('.adm-modal')).not.toBeNull();
  });
});
