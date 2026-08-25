import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryManagement } from '@/features/category-management';

const hooks = vi.hoisted(() => ({
  patchCategory: vi.fn(),
  refetchCategories: vi.fn(),
  useCategoryIconCatalogQuery: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  usePatchLedgerCategoryMutation: vi.fn(),
  useReorderLedgerCategoriesMutation: vi.fn(),
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useCategoryIconCatalogQuery: hooks.useCategoryIconCatalogQuery,
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
  usePatchLedgerCategoryMutation: hooks.usePatchLedgerCategoryMutation,
  useReorderLedgerCategoriesMutation: hooks.useReorderLedgerCategoriesMutation,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => key === 'categories.moreCount'
      ? `More categories (${options?.count ?? 0})`
      : key,
  }),
}));

const expenseCategories = [
  createCategory({ id: 1, name: 'Meals', status: 'ACTIVE' }),
  createCategory({ id: 2, name: 'Transport', sortOrder: 1, status: 'ACTIVE' }),
  createCategory({ id: 3, name: 'Old meals', sortOrder: 2, status: 'ARCHIVED' }),
];

const incomeCategories = [
  createCategory({ id: 4, name: 'Salary', status: 'ACTIVE', type: 'add' }),
  createCategory({ id: 5, name: 'Old bonus', sortOrder: 1, status: 'ARCHIVED', type: 'add' }),
];

let cleanup: (() => void) | undefined;

function createCategory(overrides: Partial<CategoryEntity> & Pick<CategoryEntity, 'id' | 'name' | 'status'>): CategoryEntity {
  return {
    createdAt: '2026-08-20T00:00:00.000Z',
    icon: 'meal',
    iconType: 'BUILTIN',
    isCustom: true,
    ledgerId: 'ledger-1',
    sortOrder: 0,
    type: 'sub',
    updatedAt: '2026-08-20T00:00:00.000Z',
    version: 1,
    ...overrides,
  };
}

function query(data: CategoryEntity[]) {
  return {
    data,
    isError: false,
    isLoading: false,
    refetch: hooks.refetchCategories,
  };
}

function renderCategoryManagement() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(CategoryManagement, {
    canManage: true,
    ledgerId: 'ledger-1',
  })));
  cleanup = () => act(() => root.unmount());
  return container;
}

function getArchivedToggle(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>('button[aria-expanded]');
  if (!button)
    throw new Error('Archived category toggle was not rendered');
  return button;
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useLedgerCategoriesQuery.mockImplementation((options: { params: { type: CategoryAmountType } }) => (
    query(options.params.type === 'add' ? incomeCategories : expenseCategories)
  ));
  hooks.useCategoryIconCatalogQuery.mockReturnValue(query([]));
  hooks.patchCategory.mockImplementation((options: {
    categoryId: number;
    data: { status: CategoryEntity['status'] };
  }) => {
    const category = [...expenseCategories, ...incomeCategories]
      .find(item => item.id === options.categoryId);
    if (!category)
      throw new Error(`Unknown category: ${options.categoryId}`);
    return Promise.resolve({
      ...category,
      status: options.data.status,
      version: category.version + 1,
    });
  });
  hooks.usePatchLedgerCategoryMutation.mockReturnValue([hooks.patchCategory, { isLoading: false }]);
  hooks.useReorderLedgerCategoriesMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('category management archived categories', () => {
  it('keeps archived categories collapsed until the summary button is pressed', async () => {
    const container = renderCategoryManagement();
    const toggle = getArchivedToggle(container);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toContain('More categories (1)');
    expect(toggle.querySelector('svg')?.classList.contains('rotate-180')).toBe(false);
    expect(container.textContent).not.toContain('Old meals');

    await act(async () => toggle.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.querySelector('svg')?.classList.contains('rotate-180')).toBe(true);
    expect(container.textContent).toContain('Old meals');
  });

  it('collapses archived categories when the record type changes', async () => {
    const container = renderCategoryManagement();
    const toggle = getArchivedToggle(container);
    const incomeTypeButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'records.type.add');

    await act(async () => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    await act(async () => incomeTypeButton?.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(container.textContent).not.toContain('Old bonus');
  });

  it('does not expand archived categories after hiding an active category', async () => {
    const container = renderCategoryManagement();
    const toggle = getArchivedToggle(container);
    const archiveButton = container.querySelector<HTMLButtonElement>('[aria-label="categories.archive"]');

    await act(async () => archiveButton?.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toContain('More categories (2)');
    expect(container.querySelector('#archived-category-list')).toBeNull();
  });

  it('keeps archived categories expanded after restoring the last item', async () => {
    const container = renderCategoryManagement();
    const toggle = getArchivedToggle(container);

    await act(async () => toggle.click());
    const restoreButton = container.querySelector<HTMLButtonElement>('[aria-label="categories.restoreName"]');
    await act(async () => restoreButton?.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent).toContain('More categories (0)');
    expect(container.textContent).toContain('categories.noMore');
  });
});
