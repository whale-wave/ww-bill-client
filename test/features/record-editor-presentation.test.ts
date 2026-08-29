import type { CategoryEntity } from '@/entities/category';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRecordAttachmentContentApi } from '@/entities/record';
import {
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { confirmDangerousAction } from '@/shared/ui';

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  confirmDangerousAction: vi.fn(),
  DesignIcon: ({ name }: { name: string }) => createElement('span', { 'data-design-icon': name }),
  IllustratedEmptyState: ({ testId, title }: { testId: string; title: string }) => createElement('div', { 'data-testid': testId }, title),
}));

vi.mock('@/entities/record', () => ({
  getRecordAttachmentContentApi: vi.fn(),
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

let cleanup: (() => void) | undefined;
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectUrl });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectUrl });
  vi.clearAllMocks();
});

function TestEditor({
  onArchiveTag,
  onCancel = vi.fn(),
  withTags = false,
}: {
  onArchiveTag?: (tagId: string) => Promise<void>;
  onCancel?: () => void;
  withTags?: boolean;
}) {
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
    onArchiveTag,
    onCancel,
    tags: withTags ? [{ id: 'tag-a', name: '聚餐' }] : [],
  });
}

describe('record editor presentation', () => {
  it('uses the shared empty state when no bookkeeping categories exist', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    function EmptyEditor() {
      return createElement(RecordEditorPresentation, {
        categories: [],
        categoryState: 'ready',
        controller: useRecordEditorController({
          onSubmit: vi.fn(),
          seed: { recordType: 'sub', time: '2026-07-21T12:00:00.000Z' },
        }),
        onCancel: vi.fn(),
      });
    }

    act(() => root.render(createElement(EmptyEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-testid="record-editor-empty-state"]')).not.toBeNull();
    expect(container.textContent).toContain('record:bookkeeping.emptyCategoryTitle');
  });

  it('moves from category selection to the amount keypad', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-editor-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-keypad]')).toBeNull();
    expect(container.querySelector('[data-record-editor-header]')?.classList).toContain('px-5');
    expect(container.querySelector('[data-record-editor-categories]')?.classList).toContain('px-[14px]');
    expect(container.querySelector('[data-record-editor-category="1"]')?.classList).toContain('h-[92.5px]');

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-presentation]')?.getAttribute('data-record-editor-stage')).toBe('amount');
    expect(container.querySelector('[data-record-editor-amount]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-categories]')).toBeNull();
    expect(container.querySelector('[data-record-editor-header]')?.classList).toContain('px-[22px]');
    expect(container.querySelector('[data-record-editor-note]')?.classList).toContain('mx-[22px]');
    expect(container.querySelector('[data-record-editor-total]')?.classList).toContain('text-[54px]');
    const backspace = container.querySelector<HTMLButtonElement>('[aria-label="record:bookkeeping.backspace"]');
    expect(backspace?.textContent).toContain('record:bookkeeping.backspace');
    expect(backspace?.querySelector('svg')).not.toBeNull();
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
    expect(document.body.querySelector('[data-record-editor-selected-tags]')).not.toBeNull();

    act(() => document.body.querySelector<HTMLButtonElement>('[aria-label="移除标签 聚餐"]')?.click());

    expect(document.body.querySelector('[data-record-editor-selected-tags]')).toBeNull();
    expect(tag?.getAttribute('aria-pressed')).toBe('false');
  });

  it('archives a tag from the picker and removes it from the current draft', async () => {
    const onArchiveTag = vi.fn().mockResolvedValue(undefined);
    vi.mocked(confirmDangerousAction).mockResolvedValue(true);
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { onArchiveTag, withTags: true })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    const tag = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '聚餐');
    act(() => tag?.click());

    await act(async () => {
      document.body.querySelector<HTMLButtonElement>('[data-record-editor-tag-delete="tag-a"]')?.click();
      await Promise.resolve();
    });

    expect(confirmDangerousAction).toHaveBeenCalledOnce();
    expect(onArchiveTag).toHaveBeenCalledWith('tag-a');
    expect(document.body.querySelector('[data-record-editor-selected-tags]')).toBeNull();
  });

  it('leaves the editor from the back button and opens categories from the category name', () => {
    const onCancel = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { onCancel })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    expect(container.querySelector('[data-record-editor-category-trigger]')?.textContent).toBe('餐饮');

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category-trigger]')?.click());
    expect(container.querySelector('[data-record-editor-presentation]')?.getAttribute('data-record-editor-stage')).toBe('category');

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-cancel]')?.click());
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows the authenticated thumbnail in edit mode and opens a full-screen preview', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn()
        .mockReturnValueOnce('blob:thumbnail')
        .mockReturnValueOnce('blob:content'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.mocked(getRecordAttachmentContentApi)
      .mockResolvedValueOnce(new Blob(['thumbnail']))
      .mockResolvedValueOnce(new Blob(['content']));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function ExistingImageEditor() {
      return createElement(RecordEditorPresentation, {
        categories: [category],
        categoryState: 'ready',
        controller: useRecordEditorController({
          onSubmit: vi.fn(),
          seed: {
            attachment: {
              byteSize: 12,
              contentHash: 'hash',
              createdAt: '',
              height: 1,
              id: 'attachment-1',
              mimeType: 'image/webp',
              sortOrder: 0,
              type: 'IMAGE',
              width: 1,
            },
            category,
            recordType: 'sub',
            time: '2026-07-21T12:00:00.000Z',
          },
        }),
        onCancel: vi.fn(),
      });
    }

    await act(async () => root.render(createElement(ExistingImageEditor)));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    expect(getRecordAttachmentContentApi).toHaveBeenCalledWith('attachment-1', 'thumbnail');
    expect(container.querySelector<HTMLImageElement>('[data-record-editor-image-preview] img')?.src).toBe('blob:thumbnail');

    await act(async () => container.querySelector<HTMLButtonElement>('[data-record-editor-image-preview]')?.click());

    expect(getRecordAttachmentContentApi).toHaveBeenLastCalledWith('attachment-1', 'content');
    expect(document.body.querySelector('[aria-label="关闭图片预览"] img')?.getAttribute('src')).toBe('blob:content');
  });

  it('allows the amount panel to shrink before clipping the keypad', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-total]')?.parentElement?.classList).toContain('min-h-0');
    expect(container.querySelector('[data-record-editor-total]')?.parentElement?.classList).not.toContain('min-h-[220px]');
    expect(container.querySelector('[data-record-editor-keypad]')?.classList).toContain('pb-[max(14px,env(safe-area-inset-bottom))]');
  });
});
