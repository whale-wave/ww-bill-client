import type { RecordEntry } from '@/entities/record';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRecordAttachmentContentApi } from '@/entities/record/api';
import { RecordAttachmentSection } from '@/entities/record/ui/RecordAttachmentSection';

vi.mock('@/entities/record/api', () => ({
  getRecordAttachmentContentApi: vi.fn(),
}));

const attachment: NonNullable<RecordEntry['attachments']>[number] = {
  byteSize: 12,
  contentHash: 'hash',
  createdAt: '',
  height: 1,
  id: 'attachment-1',
  mimeType: 'image/webp',
  sortOrder: 0,
  type: 'IMAGE',
  width: 1,
};

let cleanup: (() => void) | undefined;
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectUrl });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectUrl });
  vi.mocked(getRecordAttachmentContentApi).mockReset();
  vi.restoreAllMocks();
});

describe('record attachment section', () => {
  it('shows one count entry and makes every attached image available in the gallery', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:image') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.mocked(getRecordAttachmentContentApi).mockResolvedValue(new Blob(['image']));
    const client = new QueryClient();
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(QueryClientProvider, { client }, createElement(RecordAttachmentSection, { attachments: [attachment, { ...attachment, id: 'attachment-2', sortOrder: 1 }] })));
      await Promise.resolve();
    });
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-attachment-count]')?.textContent).toBe('2');
    await act(async () => container.querySelector<HTMLButtonElement>('[data-record-attachment-trigger] button')?.click());
    expect(document.body.querySelector('[data-image-gallery-header]')).not.toBeNull();
    expect(document.body.querySelectorAll('[data-record-attachment-gallery] button')).toHaveLength(2);
    await act(async () => document.body.querySelectorAll<HTMLButtonElement>('[data-record-attachment-gallery] button')[1].click());
    await vi.waitFor(() => expect(getRecordAttachmentContentApi).toHaveBeenCalledWith('attachment-2', 'content', undefined));
  });

  it('shows a visible skeleton first, then reuses the session Blob cache after remounting', async () => {
    const createObjectUrl = vi.fn().mockReturnValue('blob:thumbnail');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    let resolveThumbnail: ((value: Blob) => void) | undefined;
    vi.mocked(getRecordAttachmentContentApi).mockReturnValue(new Promise((resolve) => {
      resolveThumbnail = resolve;
    }));

    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } },
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    const render = () => root.render(createElement(QueryClientProvider, { client }, createElement(RecordAttachmentSection, { attachments: [attachment] })));

    act(render);
    expect(container.querySelector('[role="status"]')).not.toBeNull();

    await vi.waitFor(() => expect(resolveThumbnail).toBeTypeOf('function'));
    await act(async () => {
      resolveThumbnail?.(new Blob(['thumbnail']));
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(container.querySelector<HTMLImageElement>('img')?.getAttribute('src')).toBe('blob:thumbnail');
    expect(getRecordAttachmentContentApi).toHaveBeenCalledTimes(1);

    act(() => root.unmount());
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:thumbnail');

    const secondContainer = document.createElement('div');
    const secondRoot = createRoot(secondContainer);
    await act(async () => {
      secondRoot.render(createElement(QueryClientProvider, { client }, createElement(RecordAttachmentSection, { attachments: [attachment] })));
      await Promise.resolve();
    });
    cleanup = () => act(() => secondRoot.unmount());

    expect(secondContainer.querySelector<HTMLImageElement>('img')?.getAttribute('src')).toBe('blob:thumbnail');
    expect(getRecordAttachmentContentApi).toHaveBeenCalledTimes(1);
  });

  it('opens the full image in the touch gesture viewer', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => blob.size === 7 ? 'blob:content' : 'blob:thumbnail'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    let resolveThumbnail: ((value: Blob) => void) | undefined;
    let resolveContent: ((value: Blob) => void) | undefined;
    vi.mocked(getRecordAttachmentContentApi).mockImplementation((_id, variant) => new Promise((resolve) => {
      if (variant === 'thumbnail')
        resolveThumbnail = resolve;
      else
        resolveContent = resolve;
    }));
    const client = new QueryClient();
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(QueryClientProvider, { client }, createElement(RecordAttachmentSection, { attachments: [attachment] })));
      await Promise.resolve();
    });
    cleanup = () => act(() => root.unmount());

    await vi.waitFor(() => expect(resolveThumbnail).toBeTypeOf('function'));
    await act(async () => {
      resolveThumbnail?.(new Blob(['thumbnail']));
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>('button')?.click();
      await Promise.resolve();
    });

    expect(document.body.querySelectorAll('[data-record-attachment-gallery] button')).toHaveLength(1);
    await act(async () => {
      document.body.querySelector<HTMLButtonElement>('[data-record-attachment-gallery] button')?.click();
      await Promise.resolve();
    });

    expect(getRecordAttachmentContentApi).toHaveBeenLastCalledWith('attachment-1', 'content', undefined);
    await vi.waitFor(() => expect(resolveContent).toBeTypeOf('function'));
    await act(async () => {
      resolveContent?.(new Blob(['content']));
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    await vi.waitFor(() => expect(document.body.querySelector<HTMLImageElement>('.adm-image-viewer-control img')?.src).toBe('blob:content'));
  });
});
