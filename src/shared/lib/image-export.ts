import { Capacitor, registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface GalleryImagePlugin {
  saveImageToGallery: (options: { data: string; fileName: string }) => Promise<{ uri: string }>;
}

const GalleryImage = registerPlugin<GalleryImagePlugin>('GalleryImage');
const SHARE_DIRECTORY = 'bill-image-shares';

export class ImageShareCancelledError extends Error {
  constructor() {
    super('Image sharing was cancelled');
    this.name = 'ImageShareCancelledError';
  }
}

export class GalleryPermissionDeniedError extends Error {
  constructor(message = 'Gallery permission was denied') {
    super(message);
    this.name = 'GalleryPermissionDeniedError';
  }
}

export function normalizePngFileName(fileName: string): string {
  const printableName = Array.from(fileName.trim())
    .map(character => character.charCodeAt(0) < 32 ? '_' : character)
    .join('');
  const safeName = printableName.replace(/[\\/:*?"<>|]/g, '_') || 'image';
  return `${safeName.replace(/\.png$/i, '')}.png`;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value)
        resolve(value);
      else
        reject(new Error('Canvas could not be converted to an image'));
    }, 'image/png');
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Image could not be read'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function isCancellation(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError')
    return true;
  if (!(error instanceof Error))
    return false;
  return /cancel|dismiss/i.test(`${error.name} ${error.message}`);
}

export async function saveImageToGallery(blob: Blob, fileName: string): Promise<'gallery' | 'downloaded'> {
  const normalizedName = normalizePngFileName(fileName);
  if (Capacitor.getPlatform() === 'android') {
    try {
      const data = await blobToDataUrl(blob);
      await GalleryImage.saveImageToGallery({ data, fileName: normalizedName });
      return 'gallery';
    }
    catch (error) {
      if (error instanceof Error && /permission/i.test(`${error.name} ${error.message}`))
        throw new GalleryPermissionDeniedError(error.message);
      throw error;
    }
  }
  downloadBlob(blob, normalizedName);
  return 'downloaded';
}

export async function cleanupImageShareCache() {
  if (!Capacitor.isNativePlatform())
    return;
  try {
    const result = await Filesystem.readdir({ directory: Directory.Cache, path: SHARE_DIRECTORY });
    await Promise.all(result.files.map(file => Filesystem.deleteFile({
      directory: Directory.Cache,
      path: `${SHARE_DIRECTORY}/${file.name}`,
    }).catch(() => undefined)));
  }
  catch {
    // The directory does not exist on the first share.
  }
}

export async function shareImage(blob: Blob, fileName: string): Promise<void> {
  const normalizedName = normalizePngFileName(fileName);
  if (Capacitor.isNativePlatform()) {
    await cleanupImageShareCache();
    await Filesystem.mkdir({ directory: Directory.Cache, path: SHARE_DIRECTORY, recursive: true });
    const dataUrl = await blobToDataUrl(blob);
    const path = `${SHARE_DIRECTORY}/${normalizedName}`;
    const written = await Filesystem.writeFile({
      data: dataUrl.slice(dataUrl.indexOf(',') + 1),
      directory: Directory.Cache,
      path,
    });
    try {
      await Share.share({ dialogTitle: normalizedName, files: [written.uri], title: normalizedName });
    }
    catch (error) {
      if (isCancellation(error))
        throw new ImageShareCancelledError();
      throw error;
    }
    finally {
      await Filesystem.deleteFile({ directory: Directory.Cache, path }).catch(() => undefined);
    }
    return;
  }

  const file = new File([blob], normalizedName, { type: 'image/png' });
  const canShare = typeof navigator.share === 'function'
    && (!navigator.canShare || navigator.canShare({ files: [file] }));
  if (!canShare)
    throw new Error('File sharing is not supported by this browser');
  try {
    await navigator.share({ files: [file], title: normalizedName });
  }
  catch (error) {
    if (isCancellation(error))
      throw new ImageShareCancelledError();
    throw error;
  }
}
