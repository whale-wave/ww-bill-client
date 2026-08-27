import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GalleryPermissionDeniedError,
  getImageExportCaptureOptions,
  ImageShareCancelledError,
  normalizePngFileName,
  saveImageToGallery,
  shareImage,
  waitForImageExportReady,
} from '@/shared/lib/image-export';

const nativeMocks = vi.hoisted(() => ({
  deleteFile: vi.fn(),
  getPlatform: vi.fn(() => 'web'),
  isNativePlatform: vi.fn(() => false),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  saveImageToGallery: vi.fn(),
  share: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: nativeMocks.getPlatform,
    isNativePlatform: nativeMocks.isNativePlatform,
  },
  registerPlugin: () => ({ saveImageToGallery: nativeMocks.saveImageToGallery }),
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: {
    deleteFile: nativeMocks.deleteFile,
    mkdir: nativeMocks.mkdir,
    readdir: nativeMocks.readdir,
    writeFile: nativeMocks.writeFile,
  },
}));

vi.mock('@capacitor/share', () => ({ Share: { share: nativeMocks.share } }));

describe('image export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nativeMocks.getPlatform.mockReturnValue('web');
    nativeMocks.isNativePlatform.mockReturnValue(false);
    nativeMocks.readdir.mockRejectedValue(new Error('missing'));
    nativeMocks.writeFile.mockResolvedValue({ uri: 'file:///cache/bill.png' });
    nativeMocks.deleteFile.mockResolvedValue(undefined);
    nativeMocks.mkdir.mockResolvedValue(undefined);
    nativeMocks.share.mockResolvedValue(undefined);
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

  it('writes native shares to cache and removes the temporary file', async () => {
    nativeMocks.isNativePlatform.mockReturnValue(true);
    await shareImage(new Blob(['png'], { type: 'image/png' }), 'bill');
    expect(nativeMocks.writeFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'bill-image-shares/bill.png' }));
    expect(nativeMocks.share).toHaveBeenCalledWith(expect.objectContaining({ files: ['file:///cache/bill.png'] }));
    expect(nativeMocks.deleteFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'bill-image-shares/bill.png' }));
  });

  it('treats a cancelled native share as non-fatal cancellation', async () => {
    nativeMocks.isNativePlatform.mockReturnValue(true);
    nativeMocks.share.mockRejectedValue(new Error('User cancelled'));
    await expect(shareImage(new Blob(['png']), 'bill')).rejects.toBeInstanceOf(ImageShareCancelledError);
    expect(nativeMocks.deleteFile).toHaveBeenCalled();
  });
});
