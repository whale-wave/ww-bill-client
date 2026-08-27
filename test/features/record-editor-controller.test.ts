import type { CategoryEntity } from '@/entities/category';
import type { RecordDraft } from '@/features/record-editor';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/ui')>()),
  Icon: () => null,
}));

const category: CategoryEntity = {
  createdAt: '',
  icon: 'food',
  iconType: 'BUILTIN',
  id: 1,
  isCustom: false,
  ledgerId: '00000000-0000-4000-8000-000000000001',
  name: '餐饮',
  sortOrder: 0,
  status: 'ACTIVE',
  type: 'sub',
  updatedAt: '',
  version: 1,
};
const submit = vi.fn<(draft: RecordDraft) => Promise<void>>();
let cleanup: (() => void) | undefined;

function Editor({ amount, editing = false, remark, tags = false }: { amount?: string; editing?: boolean; remark?: string; tags?: boolean }) {
  const controller = useRecordEditorController({
    onSubmit: submit,
    seed: {
      amount,
      category,
      recordType: 'sub',
      remark,
      tagIds: editing ? ['00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000302'] : undefined,
      time: '2026-07-21T12:00:00.000Z',
    },
    isEditing: editing,
    supportsTags: tags,
  });
  return createElement(RecordEditorPresentation, {
    categories: [category],
    categoryState: 'ready',
    controller,
    onCancel: vi.fn(),
    tags: tags ? [{ id: '00000000-0000-4000-8000-000000000303', name: '出游' }] : undefined,
  });
}

function renderEditor(props: { amount?: string; editing?: boolean; remark?: string; tags?: boolean } = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(Editor, props)));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

function clickButton(container: HTMLElement, label: string) {
  const button = [...container.querySelectorAll('button')]
    .find(element => element.textContent === label);
  if (!button)
    throw new Error(`Missing editor button: ${label}`);
  act(() => button.click());
}

async function complete(container: HTMLElement) {
  const button = [...container.querySelectorAll('button')]
    .find(element => element.textContent === '完成' || element.textContent === '=');
  if (!button)
    throw new Error('Missing completion button');
  await act(async () => button.click());
}

beforeEach(() => {
  submit.mockReset();
  submit.mockResolvedValue();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record editor controller', () => {
  it('submits a positive amount and falls back to the selected category name', async () => {
    const container = renderEditor();
    clickButton(container, '1');
    await complete(container);

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      amount: '1',
      categoryId: 1,
      remark: '餐饮',
      type: 'sub',
    }));
  });

  it('resolves addition and subtraction expressions before submission', async () => {
    const container = renderEditor();
    clickButton(container, '5');
    clickButton(container, '-');
    clickButton(container, '2');
    clickButton(container, '+');
    clickButton(container, '3');
    await complete(container);

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ amount: '6' }));
  });

  it('resets the selected category when the record type changes', () => {
    const container = renderEditor();

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-cancel]')?.click());
    clickButton(container, 'record:bookkeeping.income');

    expect(container.querySelector('[data-record-editor-keypad]')).toBeNull();
    expect(container.querySelector('[data-record-editor-category="1"]')?.getAttribute('aria-pressed'))
      .toBe('false');
  });

  it('hides numeric keys while the note input is focused', () => {
    const container = renderEditor();
    const input = container.querySelector<HTMLInputElement>('input[type="text"]');

    act(() => input?.focus());

    expect([...container.querySelectorAll('button')].some(button => button.textContent === '1'))
      .toBe(false);
  });

  it('limits decimals to two places and supports deleting the last digit', async () => {
    const container = renderEditor();
    clickButton(container, '1');
    clickButton(container, '.');
    clickButton(container, '2');
    clickButton(container, '3');
    clickButton(container, '4');
    clickButton(container, 'record:bookkeeping.backspace');
    await complete(container);

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ amount: '1.2' }));
  });

  it('rejects zero, negative and unfinished expressions', async () => {
    const zero = renderEditor();
    clickButton(zero, '1');
    clickButton(zero, '-');
    clickButton(zero, '1');
    await complete(zero);
    expect(submit).not.toHaveBeenCalled();
    cleanup?.();

    const negative = renderEditor();
    clickButton(negative, '1');
    clickButton(negative, '-');
    clickButton(negative, '2');
    await complete(negative);
    expect(submit).not.toHaveBeenCalled();
    cleanup?.();

    const unfinished = renderEditor();
    clickButton(unfinished, '1');
    clickButton(unfinished, '+');
    await complete(unfinished);
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits the loaded amount and keeps an entered remark', async () => {
    const container = renderEditor({ amount: '20.00', remark: '七月午餐' });
    await complete(container);

    expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      amount: '20',
      remark: '七月午餐',
    }));
  });

  it('allows only one in-flight submission', () => {
    submit.mockReturnValue(new Promise(() => {}));
    const container = renderEditor({ amount: '20.00' });
    const completion = [...container.querySelectorAll('button')]
      .find(element => element.textContent === '完成');

    act(() => {
      completion?.click();
      completion?.click();
    });

    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('preserves legacy multi-tag associations until the user changes tags', async () => {
    const container = renderEditor({ amount: '20', editing: true, tags: true });
    await complete(container);
    expect(submit).toHaveBeenCalledWith(expect.not.objectContaining({ tagIds: expect.anything() }));

    submit.mockClear();
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    act(() => [...document.querySelectorAll('button')].find(button => button.textContent === '出游')?.click());
    await complete(container);
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({
      tagIds: ['00000000-0000-4000-8000-000000000303'],
    }));
  });

  it('removes the context-menu guard when the editor unmounts', () => {
    renderEditor();
    const mountedEvent = new MouseEvent('contextmenu', { cancelable: true });
    document.dispatchEvent(mountedEvent);
    expect(mountedEvent.defaultPrevented).toBe(true);

    cleanup?.();
    cleanup = undefined;
    const unmountedEvent = new MouseEvent('contextmenu', { cancelable: true });
    document.dispatchEvent(unmountedEvent);
    expect(unmountedEvent.defaultPrevented).toBe(false);
  });
});
