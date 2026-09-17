import { Capacitor, registerPlugin } from '@capacitor/core';
import { APPEARANCE_CHANGE_EVENT } from './appearance-tokens';

interface NativeStatusBarPlugin {
  setAppearance: (options: { color: string; isLightBackground: boolean }) => Promise<void>;
}

const NativeStatusBar = registerPlugin<NativeStatusBarPlugin>('NativeStatusBar');
const DEFAULT_BACKGROUND = '#f4f4f6';

function readRgb(color: string): number[] | undefined {
  const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map(value => value + value).join('') : hex;
    return [0, 2, 4].map(offset => Number.parseInt(expanded.slice(offset, offset + 2), 16));
  }
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);
  if (!rgb)
    return;
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4] ?? 1)];
}

/** Linear gradients use their first stop, matching the existing page themes. */
export function resolveStatusBarColor(backgroundImage: string, backgroundColor: string, fallback = DEFAULT_BACKGROUND): string {
  const gradientColor = backgroundImage.startsWith('linear-gradient(')
    ? backgroundImage.match(/#[\da-f]{6}\b|#[\da-f]{3}\b|rgba?\([^)]*\)/i)?.[0]
    : undefined;
  const rgb = readRgb(gradientColor ?? '') ?? readRgb(backgroundColor);
  if (!rgb)
    return fallback;
  const base = readRgb(fallback) ?? readRgb(DEFAULT_BACKGROUND)!;
  const alpha = Math.min(1, Math.max(0, rgb[3] ?? 1));
  return `#${rgb.slice(0, 3).map((value, index) => (
    Math.round(Math.min(255, Math.max(0, value * alpha + base[index] * (1 - alpha)))).toString(16).padStart(2, '0')
  )).join('')}`;
}

export function isLightStatusBarBackground(color: string): boolean {
  const channels = (readRgb(color) ?? readRgb(DEFAULT_BACKGROUND)!).slice(0, 3).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179;
}

function readPageBackground(): string {
  const rootStyle = getComputedStyle(document.documentElement);
  let color = resolveStatusBarColor(
    rootStyle.getPropertyValue('--ww-page-gradient').trim(),
    rootStyle.getPropertyValue('--ww-background-color').trim(),
  );
  // Sample the top edge, rather than an accent, button or card further down.
  const topElement = document.elementFromPoint?.(window.innerWidth / 2, 1);
  const page = topElement?.closest('.page, .page-new')
    ?? [...document.querySelectorAll('#root .page, #root .page-new')].find(element => element.getClientRects().length > 0);
  if (!page)
    return color;
  const layers: Element[] = [];
  let element: Element | null = topElement && page.contains(topElement) ? topElement : page;
  while (element) {
    layers.unshift(element);
    if (element === page)
      break;
    element = element.parentElement;
  }
  for (const layer of layers) {
    const style = getComputedStyle(layer);
    color = resolveStatusBarColor(style.backgroundImage, style.backgroundColor, color);
  }
  return color;
}

/** Runs before React and also covers lazy pages, theme changes and app resume. */
export function startSystemStatusBarSync(): () => void {
  let frame: number | undefined;
  let previousColor: string | undefined;
  const sync = () => {
    frame = undefined;
    const color = readPageBackground();
    if (color === previousColor)
      return;
    previousColor = color;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
    }
    meta.content = color;
    document.documentElement.style.setProperty('--ww-status-bar-background', color);
    if (Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('NativeStatusBar')) {
      void NativeStatusBar.setAppearance({ color, isLightBackground: isLightStatusBarBackground(color) }).catch(() => {
        // Allow a retry on resume; cosmetic failures must not block bookkeeping.
        previousColor = undefined;
      });
    }
  };
  const schedule = () => {
    if (frame === undefined)
      frame = requestAnimationFrame(sync);
  };
  const handleResume = () => {
    previousColor = undefined;
    schedule();
  };
  const observer = new MutationObserver(schedule);
  const root = document.getElementById('root');
  if (root)
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-appearance-template', 'data-design-studio-template'] });
  document.addEventListener(APPEARANCE_CHANGE_EVENT, schedule);
  document.addEventListener('visibilitychange', handleResume);
  window.addEventListener('resize', handleResume);
  window.addEventListener('pageshow', handleResume);
  sync();
  return () => {
    observer.disconnect();
    if (frame !== undefined)
      cancelAnimationFrame(frame);
    document.removeEventListener(APPEARANCE_CHANGE_EVENT, schedule);
    document.removeEventListener('visibilitychange', handleResume);
    window.removeEventListener('resize', handleResume);
    window.removeEventListener('pageshow', handleResume);
  };
}
