import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APPEARANCE_CHANGE_EVENT } from '@/shared/lib/appearance-tokens';
import { isLightStatusBarBackground, resolveStatusBarColor, startSystemStatusBarSync } from '@/shared/lib/system-status-bar';

const native = vi.hoisted(() => ({
  platform: 'web',
  isAvailable: true,
  setAppearance: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => native.platform,
    isPluginAvailable: () => native.isAvailable,
  },
  registerPlugin: () => ({ setAppearance: native.setAppearance }),
}));

let stop: (() => void) | undefined;

beforeEach(() => {
  native.platform = 'web';
  native.isAvailable = true;
  native.setAppearance.mockClear();
  document.body.innerHTML = '<div id="root"><div class="page" style="background: #f4f4f6"></div></div>';
  document.documentElement.style.setProperty('--ww-page-gradient', '#f4f4f6');
  const page = document.querySelector('.page')!;
  vi.spyOn(page, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(callback, 0, 0));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
});

afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.innerHTML = '';
  document.querySelector('meta[name="theme-color"]')?.remove();
  document.documentElement.style.removeProperty('--ww-page-gradient');
  document.documentElement.style.removeProperty('--ww-status-bar-background');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('system status bar colors', () => {
  it('uses the page gradient instead of its background or brand accent', () => {
    expect(resolveStatusBarColor('linear-gradient(155deg, rgb(231, 247, 255) 0%, rgb(255, 244, 248) 100%)', '#f4fbff')).toBe('#e7f7ff');
    expect(resolveStatusBarColor('linear-gradient(180deg, #fafbfc, #f4f6f8)', '#f7f8fa')).toBe('#fafbfc');
  });

  it('keeps the underlying background for transparent layers and composites translucent headers', () => {
    expect(resolveStatusBarColor('none', 'rgba(0, 0, 0, 0)', '#e7f7ff')).toBe('#e7f7ff');
    expect(resolveStatusBarColor('none', 'rgba(255, 255, 255, 0.5)', '#000000')).toBe('#808080');
    expect(resolveStatusBarColor('none', 'transparent', '#e7f7ff')).toBe('#e7f7ff');
  });

  it('selects dark text on light pages and white text on dark pages', () => {
    expect(isLightStatusBarBackground('#f4f4f6')).toBe(true);
    expect(isLightStatusBarBackground('#e7f7ff')).toBe(true);
    expect(isLightStatusBarBackground('#fafbfc')).toBe(true);
    expect(isLightStatusBarBackground('#202024')).toBe(false);
  });

  it('syncs web chrome at startup and after a lazy page or appearance change', async () => {
    stop = startSystemStatusBarSync();
    expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe('#f4f4f6');
    document.querySelector<HTMLElement>('.page')!.style.background = '#e7f7ff';
    await vi.waitFor(() => {
      expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe('#e7f7ff');
    });
    document.querySelector<HTMLElement>('.page')!.style.background = 'linear-gradient(180deg, #fafbfc, #f4f6f8)';
    document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
    await vi.waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--ww-status-bar-background')).toBe('#fafbfc');
    });
    expect(native.setAppearance).not.toHaveBeenCalled();
  });

  it('syncs Android colors, deduplicates mutations and reapplies after resume', async () => {
    native.platform = 'android';
    stop = startSystemStatusBarSync();
    expect(native.setAppearance).toHaveBeenCalledWith({ color: '#f4f4f6', isLightBackground: true });
    document.querySelector<HTMLElement>('.page')!.style.background = '#202024';
    await vi.waitFor(() => {
      expect(native.setAppearance).toHaveBeenLastCalledWith({ color: '#202024', isLightBackground: false });
    });
    document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(native.setAppearance).toHaveBeenCalledTimes(2);
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(native.setAppearance).toHaveBeenCalledTimes(3));
  });

  it('does not call a missing native plugin on an older installed app', () => {
    native.platform = 'android';
    native.isAvailable = false;
    stop = startSystemStatusBarSync();
    expect(native.setAppearance).not.toHaveBeenCalled();
  });

  it('stops observers and event listeners on cleanup', async () => {
    native.platform = 'android';
    const cleanup = startSystemStatusBarSync();
    cleanup();
    document.querySelector<HTMLElement>('.page')!.style.background = '#202024';
    document.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(native.setAppearance).toHaveBeenCalledTimes(1);
  });
});
