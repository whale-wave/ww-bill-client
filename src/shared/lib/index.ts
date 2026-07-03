import config from '@/shared/config';

export function downloadCanvas(canvas: HTMLCanvasElement, fileName = config.appName) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = fileName;
  a.click();
}

export * from './amount';
export * from './class-name';
export * from './component';
export * from './math';
export * from './play-sound';
export * from './regular';
export * from './system';
