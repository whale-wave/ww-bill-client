import type { RecordEntry } from '@/entities/record';
import type { RecordEditorSeed } from '@/features/record-editor';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRecordEditorController } from '@/features/record-editor';

type Controller = ReturnType<typeof useRecordEditorController>;
const category = { id: 1, icon: 'food', name: '餐饮', type: 'sub' as const };
function attachment(index: number): NonNullable<RecordEntry['attachments']>[number] {
  return {
    byteSize: 12,
    contentHash: `hash-${index}`,
    createdAt: '',
    height: 1,
    id: `attachment-${index}`,
    mimeType: 'image/webp',
    sortOrder: index,
    type: 'IMAGE',
    width: 1,
  };
}

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function setup(options: {
  attachments?: NonNullable<RecordEntry['attachments']>;
  onUploadImage?: (file: File) => Promise<string>;
  seedOverride?: Partial<RecordEditorSeed>;
} = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  let controller: Controller;
  const submit = vi.fn().mockResolvedValue(undefined);
  function Probe() {
    controller = useRecordEditorController({
      isEditing: Boolean(options.attachments),
      onSubmit: submit,
      onUploadImage: options.onUploadImage ?? (async file => file.name),
      seed: { amount: '12.50', attachments: options.attachments, category, recordType: 'sub', remark: '午餐', time: '2026-09-23T12:00:00.000Z', ...options.seedOverride },
    });
    return null;
  }
  act(() => root.render(createElement(Probe)));
  cleanup = () => act(() => root.unmount());
  return {
    get controller() {
      return controller!;
    },
    submit,
  };
}

describe('record editor images', () => {
  it('accepts at most nine and submits the completed asset collection', async () => {
    const editor = setup();
    const files = Array.from({ length: 10 }, (_, index) => new File(['image'], `asset-${index}`, { type: 'image/png' }));
    let accepted = 0;
    await act(async () => {
      accepted = editor.controller.handleSelectImages(files);
      await Promise.resolve();
    });
    expect(accepted).toBe(9);
    expect(editor.controller.images).toHaveLength(9);
    expect(editor.controller.canAddImages).toBe(false);
    await act(async () => editor.controller.handleSubmit());
    expect(editor.submit).toHaveBeenCalledWith(expect.objectContaining({
      imageAssetIds: files.slice(0, 9).map(file => file.name),
      remark: '午餐',
    }));
  });

  it('retains selected old images, removes others, and appends a new image', async () => {
    const editor = setup({ attachments: [attachment(0), attachment(1)] });
    act(() => editor.controller.handleRemoveImage('attachment-0'));
    await act(async () => {
      editor.controller.handleSelectImages([new File(['image'], 'new-asset', { type: 'image/png' })]);
      await Promise.resolve();
    });
    await act(async () => editor.controller.handleSubmit());
    expect(editor.submit).toHaveBeenCalledWith(expect.objectContaining({
      imageAssetIds: ['new-asset'],
      retainedAttachmentIds: ['attachment-1'],
    }));
  });

  it('blocks saving after a failed upload until the image is removed', async () => {
    const editor = setup({ onUploadImage: async () => {
      throw new Error('upload failed');
    } });
    await act(async () => {
      editor.controller.handleSelectImages([new File(['image'], 'failed', { type: 'image/png' })]);
      await Promise.resolve();
    });
    expect(editor.controller.hasImageUploadError).toBe(true);
    await act(async () => editor.controller.handleSubmit());
    expect(editor.submit).not.toHaveBeenCalled();
    act(() => editor.controller.handleRemoveImage(editor.controller.images[0].id));
    await act(async () => editor.controller.handleSubmit());
    expect(editor.submit).toHaveBeenCalledOnce();
  });

  it('restores the image collection after a category-settings round trip', async () => {
    const editor = setup();
    const files = [new File(['first'], 'first-asset'), new File(['second'], 'second-asset')];
    await act(async () => {
      editor.controller.handleSelectImages(files);
      await Promise.resolve();
    });
    const snapshot = editor.controller.getDraftSnapshot();
    cleanup?.();
    cleanup = undefined;

    const restored = setup({ seedOverride: snapshot });
    expect(restored.controller.images).toHaveLength(2);
    expect(restored.controller.images.map(image => image.kind === 'new' ? image.file : undefined)).toEqual(files);
    await act(async () => restored.controller.handleSubmit());
    expect(restored.submit).toHaveBeenCalledWith(expect.objectContaining({ imageAssetIds: ['first-asset', 'second-asset'] }));
  });

  it('waits for an in-flight upload before taking the settings draft snapshot', async () => {
    let resolveUpload!: (assetId: string) => void;
    const upload = new Promise<string>((resolve) => {
      resolveUpload = resolve;
    });
    const editor = setup({ onUploadImage: () => upload });
    act(() => editor.controller.handleSelectImages([new File(['image'], 'pending-asset')]));
    expect(editor.controller.getDraftSnapshot().pendingImages?.[0].assetId).toBeUndefined();

    const waitForUploads = editor.controller.waitForImageUploads();
    await act(async () => {
      resolveUpload('uploaded-asset');
      await waitForUploads;
    });
    const snapshot = editor.controller.getDraftSnapshot();
    expect(snapshot.pendingImages?.[0].assetId).toBe('uploaded-asset');
    cleanup?.();
    cleanup = undefined;

    const restored = setup({ seedOverride: snapshot });
    expect(restored.controller.hasImageUploadError).toBe(false);
    await act(async () => restored.controller.handleSubmit());
    expect(restored.submit).toHaveBeenCalledWith(expect.objectContaining({ imageAssetIds: ['uploaded-asset'] }));
  });
});
