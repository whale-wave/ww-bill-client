import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GalleryPermissionDeniedError,
  getImageExportCaptureOptions,
  normalizePngFileName,
  saveImageToGallery,
  waitForImageExportReady,
} from '@/shared/lib/image-export';

const nativeMocks = vi.hoisted(() => ({
  getPlatform: vi.fn(() => 'web'),
  saveImageToGallery: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: nativeMocks.getPlatform },
  registerPlugin: () => ({ saveImageToGallery: nativeMocks.saveImageToGallery }),
}));

describe('image export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nativeMocks.getPlatform.mockReturnValue('web');
    nativeMocks.saveImageToGallery.mockResolvedValue({ uri: 'content://image/1' });
  });

  it('normalizes unsafe PNG file names', () => {
    expect(normalizePngFileName('  账单:2026/08.PNG  ')).toBe('账单_2026_08.png');
    expect(normalizePngFileName('\u0001')).toBe('_.png');
  });

  it('waits for image decode and exposes stable capture dimensions', async () => {
    const root = document.createElement('div');
    const image = document.createElement('img');
    Object.defineProperty(image, 'complete', { configurable: true, value: true });
    image.decode = vi.fn().mockResolvedValue(undefined);
    root.append(image);
    Object.defineProperty(root, 'scrollWidth', { configurable: true, value: 375 });
    Object.defineProperty(root, 'scrollHeight', { configurable: true, value: 800 });

    await waitForImageExportReady(root, { frameCount: 0 });

    expect(image.decode).toHaveBeenCalledOnce();
    expect(getImageExportCaptureOptions(root)).toEqual({
      height: 800,
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      width: 375,
      windowHeight: 800,
      windowWidth: 375,
    });
  });

  it('uses the Android gallery plugin for native saves', async () => {
    nativeMocks.getPlatform.mockReturnValue('android');
    const result = await saveImageToGallery(new Blob(['png'], { type: 'image/png' }), 'August');
    expect(result).toBe('gallery');
    expect(nativeMocks.saveImageToGallery).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'August.png' }));
  });

  it('maps native permission failures to a typed error', async () => {
    nativeMocks.getPlatform.mockReturnValue('android');
    nativeMocks.saveImageToGallery.mockRejectedValue(new Error('storage permission denied'));
    await expect(saveImageToGallery(new Blob(['png']), 'bill')).rejects.toBeInstanceOf(GalleryPermissionDeniedError);
  });
});
