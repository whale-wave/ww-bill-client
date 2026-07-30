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

vi.mock('@/shared/ui', () => ({
  Icon: () => null,
}));

const category: CategoryEntity = {
  createdAt: '',
  icon: 'food',
  id: 1,
  name: '餐饮',
  type: 'sub',
  updatedAt: '',
};
const submit = vi.fn<(draft: RecordDraft) => Promise<void>>();
let cleanup: (() => void) | undefined;

function Editor({ amount, remark }: { amount?: string; remark?: string }) {
  const controller = useRecordEditorController({
    onSubmit: submit,
    seed: {
      amount,
      category,
      recordType: 'sub',
      remark,
      time: '2026-07-21T12:00:00.000Z',
    },
  });
  return createElement(RecordEditorPresentation, {
    categories: [category],
    categoryState: 'ready',
    controller,
    onCancel: vi.fn(),
  });
}

function renderEditor(props: { amount?: string; remark?: string } = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(Editor, props)));
  cleanup = () => act(() => root.unmount());
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

  it('rejects zero, negative and unfinished expressions', async () => {
    const zero = renderEditor();
    clickButton(zero, '1');
    clickButton(zero, '-');
    clickButton(zero, '1');
    await complete(zero);
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
});
