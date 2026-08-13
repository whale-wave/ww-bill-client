import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CreateBudgetCategoryPage from '@/pages/create-budget-category/CreateBudgetCategoryPage';

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useGetCategoryQuery: () => ({
    data: [{
      createdAt: '',
      icon: 'food',
      id: 1,
      name: '餐饮',
      type: 'sub',
      updatedAt: '',
    }],
  }),
}));

vi.mock('@/pages/budget/ui', () => ({
  BudgetModel: ({ category, visible }: { category?: { name: string }; visible: boolean }) => createElement(
    'div',
    { 'data-budget-model-visible': String(visible) },
    category?.name,
  ),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('create budget category page', () => {
  it('uses the new header and the same category cards as record creation', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([
      { element: createElement(CreateBudgetCategoryPage), path: '/budget/category/:type' },
      { element: createElement('div', null, 'budget-target'), path: '/budget' },
    ], { initialEntries: ['/budget/category/1'] });
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-create-budget-category-page]')).not.toBeNull();
    expect(container.querySelector('.bwm-nav-bar')).toBeNull();
    expect(container.textContent).toContain('budget:selectCategoryTitle');
    expect(container.querySelector('[data-budget-category="1"]')?.classList).toContain('h-[92.5px]');
    expect(container.querySelector('[data-budget-category="1"] .lucide-utensils')).not.toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-budget-category="1"]')?.click());
    expect(container.querySelector('[data-budget-model-visible="true"]')?.textContent).toBe('餐饮');

    await act(async () => container.querySelector<HTMLButtonElement>('header button')?.click());
    expect(router.state.location.pathname).toBe('/budget');
    expect(router.state.location.search).toBe('?type=1');
  });
});
