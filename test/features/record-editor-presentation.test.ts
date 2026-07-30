import type { CategoryEntity } from '@/entities/category';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  Icon: ({ name }: { name: string }) => createElement('span', { 'data-icon': name }),
}));

const category: CategoryEntity = {
  createdAt: '',
  icon: 'food',
  id: 1,
  name: '餐饮',
  type: 'sub',
  updatedAt: '',
};

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function TestEditor({ withTags = false }: { withTags?: boolean }) {
  const controller = useRecordEditorController({
    onSubmit: vi.fn(),
    seed: {
      recordType: 'sub',
      time: '2026-07-21T12:00:00.000Z',
    },
    supportsTags: withTags,
  });

  return createElement(RecordEditorPresentation, {
    categories: [category],
    categoryState: 'ready',
    controller,
    onCancel: vi.fn(),
    tags: withTags ? [{ id: 'tag-a', name: '聚餐' }] : [],
  });
}

describe('record editor presentation', () => {
  it('uses the default bookkeeping layout and only opens the keypad after selecting a category', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-editor-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-keypad]')).toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-category="1"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('main')?.classList).toContain('pb-[224px]');
    expect(container.querySelector('main')?.classList).not.toContain('pb-[38px]');
    expect(container.querySelector('[data-record-editor-category="1"] span')?.classList)
      .toContain('bg-primary');
  });

  it('keeps tags as an optional fixed entry instead of a separate form layout', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { withTags: true })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-tag-trigger]')).not.toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input[type="date"]')).toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    const tag = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '聚餐');
    act(() => tag?.click());

    expect(tag?.getAttribute('aria-pressed')).toBe('true');
    expect(tag?.classList).toContain('bg-primary');
    expect(tag?.classList).not.toContain('bg-white');
  });
});
