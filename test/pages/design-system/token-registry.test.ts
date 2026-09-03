import { describe, expect, it } from 'vitest';
import { channelsToColor, colorToChannels, createThemeCss, createThemeExport, filterValidStudioOverrides, getDependentOverrides, STUDIO_TOKENS } from '@/pages/design-system/token-registry';

describe('design studio token registry', () => {
  it('keeps only registered values with a valid token format', () => {
    expect(filterValidStudioOverrides({
      '--ww-theme-color': '#3f9fbe',
      '--ww-radius-card': '22px',
      '--ww-unknown': '#ffffff',
      '--ww-card-blur': 'not-a-length',
    })).toEqual({
      '--ww-theme-color': '#3f9fbe',
      '--ww-radius-card': '22px',
    });
  });

  it('exports a portable versioned JSON and matching CSS overrides', () => {
    const tokens = { '--ww-theme-color': '#123456' };
    expect(createThemeExport('glass', tokens)).toEqual({
      version: 1,
      name: '鲸浪主题 · glass',
      baseTemplate: 'glass',
      tokens,
    });
    expect(createThemeCss('glass', tokens)).toContain('html[data-appearance-template=\'glass\']');
  });

  it('registers visual tokens and synchronizes compatible RGB semantic variables', () => {
    expect(STUDIO_TOKENS.length).toBeGreaterThanOrEqual(40);
    expect(colorToChannels('#3f9fbe')).toBe('63 159 190');
    expect(channelsToColor('63 159 190')).toBe('#3f9fbe');
    expect(getDependentOverrides('--ww-theme-color', '#3f9fbe')).toEqual({ '--ww-color-action-primary': '63 159 190' });
  });
});
