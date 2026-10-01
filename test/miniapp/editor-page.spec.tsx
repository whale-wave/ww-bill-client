import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Taro from './mocks/taro';

vi.mock('../../miniapp/src/features/auth', () => ({ useAuthGate: () => true }));
vi.mock('../../miniapp/src/features/record-create', () => ({ useCreateRecord: () => ({ isLoading: false }) }));
const categoriesState = vi.hoisted(() => ({ isError: false, isLoading: false, isEmpty: false, refetch: vi.fn() }));
vi.mock('../../miniapp/src/entities/category', () => ({
  useCategories: () => ({
    isLoading: categoriesState.isLoading,
    isError: categoriesState.isError,
    refetch: categoriesState.refetch,
    data: categoriesState.isEmpty
      ? []
      : [
          ...Array.from({ length: 7 }, (_, index) => ({ id: index + 1, name: `分类${index + 1}`, icon: 'food', parentId: null })),
          { id: 11, name: '午餐', icon: 'food', parentId: 1 },
          { id: 12, name: '晚餐', icon: 'food', parentId: 6 },
        ],
  }),
}));

let RecordCreatePage: typeof import('../../miniapp/src/pages/record-create/index').default;
let cleanup: (() => void) | undefined;
beforeAll(async () => {
  process.env.TARO_PLATFORM = 'web';
  RecordCreatePage = (await import('../../miniapp/src/pages/record-create/index')).default;
});
afterEach(() => {
  cleanup?.();
  categoriesState.isError = false;
  categoriesState.isLoading = false;
  categoriesState.isEmpty = false;
  categoriesState.refetch.mockReset();
});

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(RecordCreatePage)));
  cleanup = () => act(() => root.unmount());
  return container;
}

function click(element: Element | null | undefined) {
  act(() => element?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('miniapp editor presentation', () => {
  it('uses the compact full-height category loading presentation', () => {
    categoriesState.isLoading = true;
    const page = renderPage();
    expect(page.querySelector('.bill-record-category-loading.bill-page-loading--compact')?.textContent).toBe('正在加载分类');
    expect(page.querySelector('[data-record-editor-keypad]')).not.toBeNull();
  });
  it('uses the shared category empty state without offering unsupported actions', () => {
    categoriesState.isEmpty = true;
    const page = renderPage();
    expect(page.querySelector('.bill-record-category-empty .bill-empty-state__title')?.textContent).toBe('还没有可用分类');
    expect(page.querySelector('.bill-empty-state__description')?.textContent).toBe('请先在设置中创建收支分类，再回来记账');
    expect(page.querySelector('.bill-empty-state__action')).toBeNull();
    expect(page.querySelector('[data-record-editor-keypad]')).not.toBeNull();
  });
  it('uses the shared category error presentation and native retry callback', () => {
    categoriesState.isError = true;
    const page = renderPage();
    expect(page.querySelector('.bill-record-category-error__message')?.textContent).toBe('加载失败');
    expect(page.querySelector('.bill-empty-state')).toBeNull();
    click(page.querySelector('.bill-record-category-error__retry'));
    expect(categoriesState.refetch).toHaveBeenCalledTimes(1);
  });
  it('opens a six-column date-time sheet and discards cancellation', () => {
    const page = renderPage();
    const trigger = page.querySelector('.record-editor-detail-chip');
    const originalLabel = trigger?.textContent;
    click(trigger);
    expect(page.querySelector('.bill-date-time-picker__title')?.textContent).toBe('时间选择');
    expect(page.querySelector('.bill-date-time-picker__wheels')?.children).toHaveLength(6);
    click(page.querySelector('.bill-date-time-picker__button'));
    expect(page.querySelector('.bill-date-time-picker')).toBeNull();
    expect(trigger?.textContent).toBe(originalLabel);
  });
  it('expands below the full row and retains selection after closing', () => {
    const page = renderPage();
    const grid = page.querySelector('.bill-record-category-grid--root')!;
    click(grid.children[0]);
    const panel = page.querySelector('.bill-record-category-panel');
    expect(Array.from(grid.children).indexOf(panel!)).toBe(5);
    expect(panel?.textContent).toContain('直接记入');
    expect(panel?.textContent).toContain('午餐');
    expect(grid.children[0].querySelector('.bill-category-choice__check')).toBeNull();
    click(panel?.querySelectorAll('.record-editor-category-choice')[1]);
    expect(page.querySelector('.bill-record-category-panel')).toBeNull();
    expect(grid.children[0].querySelector('.bill-category-choice__check')).not.toBeNull();
    expect(page.querySelector('.bill-record-entry')?.textContent).toContain('午餐');
  });

  it('expands the partial last row after its last category', () => {
    const page = renderPage();
    const grid = page.querySelector('.bill-record-category-grid--root')!;
    click(grid.children[5]);
    expect(grid.lastElementChild?.classList).toContain('bill-record-category-panel');
    expect(grid.lastElementChild?.textContent).toContain('晚餐');
    click(grid.children[5]);
    expect(page.querySelector('.bill-record-category-panel')).toBeNull();
  });

  it('dims disabled controls and enables calculation after a number', () => {
    const page = renderPage();
    const operator = page.querySelector<HTMLButtonElement>('.record-editor-keypad__operator')!;
    expect(operator.disabled).toBe(true);
    expect(operator.classList).toContain('record-editor-keypad__disabled');
    const seven = Array.from(page.querySelectorAll('.record-editor-keypad__key')).find(key => key.textContent === '7');
    click(seven);
    expect(operator.disabled).toBe(false);
    expect(operator.classList).not.toContain('record-editor-keypad__disabled');
    expect(page.querySelector('.record-editor-keypad__submit--disabled')).not.toBeNull();
  });
  it('returns from note input to the amount keypad', () => {
    const hideKeyboard = vi.spyOn(Taro, 'hideKeyboard');
    const page = renderPage();
    act(() => page.querySelector('input')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    expect(page.querySelector('[data-record-editor-keypad]')).toBeNull();
    expect(page.querySelector('.create-form__pickers')).toBeNull();
    click(page.querySelector('.bill-record-entry__amount-control'));
    expect(page.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(page.querySelector('.create-form__pickers')).not.toBeNull();
    expect(hideKeyboard).toHaveBeenCalledTimes(1);
    hideKeyboard.mockRestore();
  });
});
