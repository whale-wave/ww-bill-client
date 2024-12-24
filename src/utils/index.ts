import config from '@/config';

export function downloadCanvas(canvas: HTMLCanvasElement, fileName = config.appName) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = fileName;
  a.click();
}

export function isSuccessApi<T extends SuccessResponse<any>>(
  response?: T,
): response is T {
  return response?.statusCode === 200;
}

export * from './component';
export * from './system';
export * from './regular';
export * from './math';
export * from './amount';
export * from './className';

export { default as request } from './request';
