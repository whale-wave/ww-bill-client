export { default as request } from './request';
export * from './component';
export * from './system';

export const downloadCanvas = (
  canvas: HTMLCanvasElement,
  fileName = '蓝鲸账本',
) => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = fileName;
  a.click();
};

export function isSuccessApi<T extends SuccessResponse<any>>(
  response?: T,
): response is T {
  return response?.statusCode === 200;
}
