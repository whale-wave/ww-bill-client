import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../miniapp/src/features/auth', () => ({ useAuthGate: () => true }));
vi.mock('../../miniapp/src/features/record-create', () => ({ useCreateRecord: () => ({ isLoading: false }) }));
vi.mock('../../miniapp/src/entities/category', () => ({
  useCategories: () => ({
    isLoading: false,
    isError: false,
    data: [
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
afterEach(() => cleanup?.());

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
});
