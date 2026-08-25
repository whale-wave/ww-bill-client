import config from '@/shared/config';

export function downloadCanvas(canvas: HTMLCanvasElement, fileName = config.appName) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = fileName;
  a.click();
}

export type CanvasSaveResult = 'shared' | 'downloaded';

export async function saveCanvas(canvas: HTMLCanvasElement, fileName = config.appName): Promise<CanvasSaveResult> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value)
        resolve(value);
      else
        reject(new Error('Canvas could not be converted to an image'));
    }, 'image/png');
  });
  const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
  const canShareFile = typeof navigator.share === 'function'
    && (!navigator.canShare || navigator.canShare({ files: [file] }));

  if (canShareFile) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return 'shared';
    }
    catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        throw error;
      // A delayed capture can lose iOS's transient user activation. Fall back
      // to a regular download so desktop browsers still receive the image.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return 'downloaded';
}

export * from './amount';
export * from './class-name';
export * from './component';
export * from './locale-date';
export * from './math';
export * from './play-sound';
export * from './regular';
export * from './route-prefetch';
export * from './system';
