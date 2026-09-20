import type { CropperProps } from 'react-easy-crop';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCroppedCategoryImage } from '@/features/category-management/model/category-image-crop';
import { CategoryImageCropper } from '@/features/category-management/ui/CategoryImageCropper';

vi.mock('react-easy-crop', () => ({
  default: ({ aspect, cropShape, image, onCropAreaChange, onMediaLoaded, onZoomChange, zoom }: CropperProps) => (
    <div data-aspect={aspect} data-crop-shape={cropShape} data-zoom={zoom}>
      <img
        alt=""
        onLoad={() => {
          onMediaLoaded?.({ width: 400, height: 200, naturalWidth: 400, naturalHeight: 200 });
          onCropAreaChange?.({ x: 25, y: 0, width: 50, height: 100 }, { x: 100, y: 0, width: 200, height: 200 });
        }}
        src={image}
      />
      <button data-testid="simulate-pinch" onClick={() => onZoomChange?.(2)} type="button">Pinch</button>
    </div>
  ),
}));
vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui/app-feedback', () => ({ showAppError: vi.fn() }));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
});

describe('category image square crop', () => {
  it('passes the square selection to the canvas exporter', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    const image = document.createElement('img');
    Object.defineProperty(image, 'naturalWidth', { value: 400 });
    Object.defineProperty(image, 'naturalHeight', { value: 200 });

    const result = await createCroppedCategoryImage(image, { x: 100, y: 0, width: 200, height: 200 });

    expect(drawImage).toHaveBeenCalledWith(image, 100, 0, 200, 200, 0, 0, 512, 512);
    expect(result.name).toBe('category-icon.webp');
    expect(result.type).toBe('image/webp');
  });

  it('uses a square cropper and accepts its gesture zoom changes before export', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    const onConfirm = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryImageCropper, {
      onConfirm,
      onInvalidImage: vi.fn(),
      sourceUrl: 'blob:source',
    })));
    cleanup = () => act(() => root.unmount());

    const mockCropper = container.querySelector('[data-aspect]');
    expect(mockCropper?.getAttribute('data-aspect')).toBe('1');
    expect(mockCropper?.getAttribute('data-crop-shape')).toBe('rect');
    const image = mockCropper?.querySelector('img');
    Object.defineProperty(image, 'naturalWidth', { value: 400 });
    Object.defineProperty(image, 'naturalHeight', { value: 200 });
    act(() => image?.dispatchEvent(new Event('load')));
    act(() => container.querySelector<HTMLButtonElement>('[data-testid="simulate-pinch"]')?.click());
    expect(container.querySelector('[data-aspect]')?.getAttribute('data-zoom')).toBe('2');

    const confirm = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.applyCrop');
    expect(confirm?.disabled).toBe(false);
    await act(async () => confirm?.click());

    expect(drawImage).toHaveBeenCalledWith(image, 100, 0, 200, 200, 0, 0, 512, 512);
    expect(onConfirm.mock.calls[0]?.[0]).toBeInstanceOf(File);
  });
});
