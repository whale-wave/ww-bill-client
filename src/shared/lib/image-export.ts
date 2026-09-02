import { Capacitor, registerPlugin } from '@capacitor/core';

interface GalleryImagePlugin {
  saveImageToGallery: (options: { data: string; fileName: string }) => Promise<{ uri: string }>;
  shareImage: (options: { uri: string }) => Promise<void>;
}

const GalleryImage = registerPlugin<GalleryImagePlugin>('GalleryImage');

export interface ImageExportReadinessOptions {
  fontSample?: string;
  frameCount?: number;
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

export type SavedImageResult
  = | { destination: 'gallery'; uri: string }
    | { destination: 'downloaded' };

export async function saveImageToGallery(blob: Blob, fileName: string): Promise<SavedImageResult> {
  const normalizedName = normalizePngFileName(fileName);
  if (Capacitor.getPlatform() === 'android') {
    try {
      const data = await blobToDataUrl(blob);
      const savedImage = await GalleryImage.saveImageToGallery({ data, fileName: normalizedName });
      return { destination: 'gallery', uri: savedImage.uri };
    }
    catch (error) {
      if (error instanceof Error && /permission/i.test(`${error.name} ${error.message}`))
        throw new GalleryPermissionDeniedError(error.message);
      throw error;
    }
  }
  downloadBlob(blob, normalizedName);
  return { destination: 'downloaded' };
}

export async function shareSavedImage(uri: string): Promise<void> {
  if (Capacitor.getPlatform() !== 'android')
    throw new Error('Native image sharing is unavailable on this platform');
  await GalleryImage.shareImage({ uri });
}
