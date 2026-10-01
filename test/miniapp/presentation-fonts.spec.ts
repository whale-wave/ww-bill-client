import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadFontFace = vi.hoisted(() => vi.fn());
vi.mock('@tarojs/taro', () => ({ default: { loadFontFace } }));

describe('miniapp presentation font loading', () => {
  beforeEach(() => {
    vi.resetModules();
    loadFontFace.mockReset();
  });

  it('registers shared families globally and reuses successful faces', async () => {
    loadFontFace.mockResolvedValue({});
    const { loadPresentationFonts } = await import('../../miniapp/src/shared/lib/presentation-fonts');
    expect(await loadPresentationFonts('https://static.example.com/fonts/')).toEqual({ loaded: 12, failed: 0 });
    expect(loadFontFace).toHaveBeenCalledWith(expect.objectContaining({
      family: 'Nunito Variable',
      global: true,
      source: 'url("https://static.example.com/fonts/nunito-v3.602-827cba27.woff2")',
      desc: { style: 'normal', weight: '700' },
    }));
    await loadPresentationFonts('https://static.example.com/fonts');
    expect(loadFontFace).toHaveBeenCalledTimes(12);
  });

  it('reports failed faces without rejecting startup and permits retry', async () => {
    loadFontFace.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({});
    const { loadPresentationFonts } = await import('../../miniapp/src/shared/lib/presentation-fonts');
    expect(await loadPresentationFonts('https://static.example.com/fonts')).toEqual({ loaded: 11, failed: 1 });
    expect(await loadPresentationFonts('https://static.example.com/fonts')).toEqual({ loaded: 12, failed: 0 });
    expect(loadFontFace).toHaveBeenCalledTimes(13);
  });
});
