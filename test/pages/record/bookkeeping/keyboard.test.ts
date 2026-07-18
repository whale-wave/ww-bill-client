import type { ComponentProps } from 'react';
import type { CategoryEntity } from '@/entities/category';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Keyboard from '@/pages/record/bookkeeping/keyboard';

const { postRecord } = vi.hoisted(() => ({
  postRecord: vi.fn(),
}));

vi.mock('@/entities/record', () => ({
  usePostRecordMutation: () => [postRecord],
  usePutRecordMutation: () => [vi.fn()],
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  Icon: () => null,
}));

vi.mock('@/pages/record/bookkeeping/ui', () => ({
  default: () => null,
}));

let cleanup: (() => void) | undefined;
const foodCategory: CategoryEntity = {
  createdAt: '',
  icon: '',
  id: 1,
  name: '餐饮',
  type: 'sub',
  updatedAt: '',
};

beforeEach(() => {
  postRecord.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('bookkeeping keyboard', () => {
  it('accepts a standard click when entering an amount', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const props = {
      categoryList: [foodCategory],
      change: vi.fn(),
      keyToggle: 1,
      name: '餐饮',
      state: undefined,
      stateList: ['', '', 1],
      type: 'sub',
    } as ComponentProps<typeof Keyboard>;

    act(() => root.render(createElement(Keyboard, props)));
    cleanup = () => act(() => root.unmount());

    const total = [...container.querySelectorAll('span')]
      .find(element => element.textContent === '0.00');
    const oneButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '1');

    expect(total).toBeDefined();
    expect(oneButton).toBeDefined();

    act(() => oneButton?.click());

    expect(total?.textContent).toBe('1');
  });

  it('submits a valid amount when the completion control is clicked', async () => {
    postRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
    const container = document.createElement('div');
    const root = createRoot(container);
    const props = {
      categoryList: [foodCategory],
      change: vi.fn(),
      keyToggle: 1,
      name: '餐饮',
      state: undefined,
      stateList: ['', '', 1],
      type: 'sub',
    } as ComponentProps<typeof Keyboard>;

    act(() => root.render(createElement(Keyboard, props)));
    cleanup = () => act(() => root.unmount());

    const oneButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '1');
    const completeControl = [...container.querySelectorAll('div')]
      .find(element => element.textContent === '完成' && element.children.length === 0);

    expect(oneButton).toBeDefined();
    expect(completeControl).toBeDefined();

    act(() => oneButton?.click());
    await act(async () => completeControl?.click());

    expect(postRecord).toHaveBeenCalledWith(expect.objectContaining({
      amount: '1',
      categoryId: 1,
      remark: '餐饮',
      type: 'sub',
    }));
  });

  it('submits a completed addition expression', async () => {
    postRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
    const container = document.createElement('div');
    const root = createRoot(container);
    const props: ComponentProps<typeof Keyboard> = {
      categoryList: [foodCategory],
      change: vi.fn(),
      keyToggle: 1,
      name: '餐饮',
      state: undefined,
      stateList: ['', '', 1],
      type: 'sub',
    };

    act(() => root.render(createElement(Keyboard, props)));
    cleanup = () => act(() => root.unmount());

    const oneButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '1');
    const twoButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '2');
    const addControl = [...container.querySelectorAll('div')]
      .find(element => element.textContent === '+' && element.children.length === 0);

    expect(oneButton).toBeDefined();
    expect(addControl).toBeDefined();
    expect(twoButton).toBeDefined();

    act(() => oneButton?.click());
    act(() => addControl?.click());
    act(() => twoButton?.click());

    const completeControl = [...container.querySelectorAll('div')]
      .find(element => element.textContent === '=' && element.children.length === 0);

    expect(completeControl).toBeDefined();

    await act(async () => completeControl?.click());

    expect(postRecord).toHaveBeenCalledWith(expect.objectContaining({ amount: '3' }));
  });

  it('submits a completed subtraction expression', async () => {
    postRecord.mockResolvedValue({ message: 'ok', statusCode: 200 });
    const container = document.createElement('div');
    const root = createRoot(container);
    const props: ComponentProps<typeof Keyboard> = {
      categoryList: [foodCategory],
      change: vi.fn(),
      keyToggle: 1,
      name: '餐饮',
      state: undefined,
      stateList: ['', '', 1],
      type: 'sub',
    };

    act(() => root.render(createElement(Keyboard, props)));
    cleanup = () => act(() => root.unmount());

    const fiveButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '5');
    const threeButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '3');
    const subtractControl = [...container.querySelectorAll('div')]
      .find(element => element.textContent === '-' && element.children.length === 0);

    expect(fiveButton).toBeDefined();
    expect(subtractControl).toBeDefined();
    expect(threeButton).toBeDefined();

    act(() => fiveButton?.click());
    act(() => subtractControl?.click());
    act(() => threeButton?.click());

    const completeControl = [...container.querySelectorAll('div')]
      .find(element => element.textContent === '=' && element.children.length === 0);

    expect(completeControl).toBeDefined();

    await act(async () => completeControl?.click());

    expect(postRecord).toHaveBeenCalledWith(expect.objectContaining({ amount: '2' }));
  });

  it('keeps a remark entered while editing an existing record', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const props = {
      categoryList: [foodCategory],
      change: vi.fn(),
      keyToggle: 1,
      name: '餐饮',
      state: undefined,
      stateList: ['0.1', '2026-07-16T00:00:00.000Z', 7],
      type: 'sub',
    } as ComponentProps<typeof Keyboard>;

    act(() => root.render(createElement(Keyboard, props)));
    cleanup = () => act(() => root.unmount());

    const input = container.querySelector('input');
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;

    expect(input).not.toBeNull();
    expect(setValue).toBeDefined();

    act(() => {
      setValue?.call(input, 'P9 烟测记录');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(input?.value).toBe('P9 烟测记录');
  });
});
