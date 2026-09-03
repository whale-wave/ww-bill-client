import type { RefObject } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BudgetEditorPresentation,
  BudgetEntityType,
  BudgetPeriodDropdown,
  BudgetPresentation,
} from '@/entities/budget';

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: { setOption: vi.fn() } }),
}));

let cleanup: (() => void) | undefined;

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(MemoryRouter, null, element)));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('budget presentation', () => {
  it('keeps the month/year selector controlled by the page adapter', () => {
    const handlePeriodChange = vi.fn();
    const container = render(createElement(BudgetPeriodDropdown, {
      budgetEntityType: BudgetEntityType.MONTH,
      dropDownWrapperRef: { current: document.body } as RefObject<HTMLDivElement>,
      onBudgetEntityTypeChange: handlePeriodChange,
    }));

    expect(container.textContent).toContain('dropdown.monthlyBudget');
    act(() => container.querySelector<HTMLElement>(`[data-budget-type="${BudgetEntityType.YEAR}"]`)?.click());

    expect(handlePeriodChange).toHaveBeenCalledWith(BudgetEntityType.YEAR);
  });

  it('renders summary and category rows and forwards their edit actions', () => {
    const handleSummaryEdit = vi.fn();
    const handleCategoryEdit = vi.fn();
    const handleAddCategory = vi.fn();
    const container = render(createElement(BudgetPresentation, {
      budgetEntityType: BudgetEntityType.MONTH,
      categories: [{
        amount: '30.00',
        budgetAmount: '100.00',
        category: { icon: 'food', name: 'Dining' },
        id: 'category-1',
        remaining: '70.00',
        remainingPercentage: 70,
      }],
      onAddCategory: handleAddCategory,
      onCategoryEdit: handleCategoryEdit,
      onSummaryCreate: vi.fn(),
      onSummaryEdit: handleSummaryEdit,
      summary: {
        amount: '100.00',
        budgetAmount: '1000.00',
        id: 'summary-1',
        remaining: '900.00',
        remainingPercentage: 90,
        title: 'July household budget',
      },
    }));

    expect(container.textContent).toContain('July household budget');
    expect(container.textContent).toContain('Dining');
    expect(container.textContent).toContain('900.00');
    expect(container.textContent).toContain('70.00');
    expect(container.querySelector('[data-budget-id="category-1"] .lucide-cooking-pot')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="summary-1"]')?.closest('article')?.classList).toContain('ww-surface--raised');
    expect(container.querySelector('[data-budget-id="category-1"]')?.closest('article')?.classList).toContain('ww-surface--content');

    act(() => container.querySelector<HTMLButtonElement>('[data-budget-id="summary-1"] [data-budget-item-action]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-budget-id="category-1"] [data-budget-item-action]')?.click());
    act(() => container.querySelector<HTMLElement>('[data-budget-add-category]')?.click());

    expect(handleSummaryEdit).toHaveBeenCalledOnce();
    expect(handleCategoryEdit).toHaveBeenCalledWith('category-1');
    expect(handleAddCategory).toHaveBeenCalledOnce();
  });

  it('uses the default summary empty state and create action', () => {
    const handleSummaryCreate = vi.fn();
    const container = render(createElement(BudgetPresentation, {
      budgetEntityType: BudgetEntityType.MONTH,
      categories: [],
      onAddCategory: vi.fn(),
      onCategoryEdit: vi.fn(),
      onSummaryCreate: handleSummaryCreate,
      onSummaryEdit: vi.fn(),
    }));

    expect(container.textContent).toContain('emptyBudget');
    expect(container.querySelector('[data-budget-add-category]')).toBeNull();
    const createButton = container.querySelector('[data-testid="budget-empty-state"] button');
    expect(createButton).not.toBeNull();
    expect(createButton?.classList).toContain('bg-primary');

    act(() => createButton?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(handleSummaryCreate).toHaveBeenCalledOnce();
  });

  it('uses the default category empty state and fixed add action', () => {
    const container = render(createElement(BudgetPresentation, {
      budgetEntityType: BudgetEntityType.YEAR,
      categories: [],
      onAddCategory: vi.fn(),
      onCategoryEdit: vi.fn(),
      onSummaryCreate: vi.fn(),
      onSummaryEdit: vi.fn(),
      summary: {
        amount: 20,
        budgetAmount: 100,
        id: 'summary-1',
        remaining: 80,
        remainingPercentage: '80',
      },
    }));

    expect(container.textContent).toContain('emptyCategoryBudget');
    expect(container.querySelector('[data-budget-add-category]')).not.toBeNull();
    expect(container.querySelector('[data-budget-add-category]')?.closest('.shrink-0')).not.toBeNull();
  });

  it('uses one controlled editor presentation for summary and category budgets', () => {
    const handleAmountChange = vi.fn();
    const handleCategoryChange = vi.fn();
    const handleSave = vi.fn();
    const container = render(createElement(BudgetEditorPresentation, {
      amount: '120',
      amountPlaceholder: 'Amount',
      cancelLabel: 'Cancel',
      categoryOptions: [{ label: 'Dining', value: '1' }],
      categoryValue: '1',
      onAmountChange: handleAmountChange,
      onCancel: vi.fn(),
      onCategoryChange: handleCategoryChange,
      onSave: handleSave,
      saveLabel: 'Save',
      title: 'Monthly category',
      visible: true,
    }));

    expect(container.querySelector('[data-budget-editor]')).not.toBeNull();
    expect(container.textContent).toContain('Monthly category');
    expect(container.textContent).toContain('Dining');
    expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('120');
  });
});
