import { Capacitor, registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface GalleryImagePlugin {
  saveImageToGallery: (options: { data: string; fileName: string }) => Promise<{ uri: string }>;
}

const GalleryImage = registerPlugin<GalleryImagePlugin>('GalleryImage');
const SHARE_DIRECTORY = 'bill-image-shares';

export interface ImageExportReadinessOptions {
  fontSample?: string;
  frameCount?: number;
}

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

function waitForAnimationFrames(count: number): Promise<void> {
  return Array.from({ length: count }).reduce<Promise<void>>(
    promise => promise.then(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))),
    Promise.resolve(),
  );
}

async function waitForImageDecode(image: HTMLImageElement): Promise<void> {
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  }
  if (image.complete && typeof image.decode === 'function')
    await image.decode().catch(() => undefined);
}

export async function waitForImageExportReady(element: HTMLElement, options: ImageExportReadinessOptions = {}): Promise<void> {
  const { fontSample = '', frameCount = 2 } = options;
  await Promise.all(Array.from(element.querySelectorAll('img')).map(image => waitForImageDecode(image)));

  if (typeof document !== 'undefined' && 'fonts' in document) {
    const faces = await Promise.all([
      document.fonts.load('700 16px "Noto Sans SC Variable"', fontSample),
      document.fonts.load('700 16px "Nunito Variable"', '0123456789.%+-¥￥'),
    ]);
    if (faces.some(face => face.length === 0))
      throw new Error('Export font face was not loaded');
    await document.fonts.ready;
    if (!document.fonts.check('700 16px "Noto Sans SC Variable"', fontSample)
      || !document.fonts.check('700 16px "Nunito Variable"', '0123456789.%+-¥￥')) {
      throw new Error('Export font check failed');
    }
  }

  await waitForAnimationFrames(frameCount);
}

export function getImageExportCaptureOptions(element: HTMLElement) {
  const width = Math.max(1, element.scrollWidth);
  const height = Math.max(1, element.scrollHeight);
  return {
    height,
    scale: Math.min(2, 16000 / height),
    scrollX: 0,
    scrollY: 0,
    width,
    windowHeight: height,
    windowWidth: width,
  };
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
