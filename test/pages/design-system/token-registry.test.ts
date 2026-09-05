import { describe, expect, it } from 'vitest';
import { channelsToColor, colorToChannels, createStudioDebugRecord, createThemeCss, createThemeExport, filterValidStudioOverrides, getDependentOverrides, getStudioTemplateTokens, resolveStudioAppearanceTemplate, STUDIO_TEMPLATES, STUDIO_TOKENS } from '@/pages/design-system/token-registry';

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

  it('keeps MONO studio-only while providing its complete preview token baseline', () => {
    const monoTokens = getStudioTemplateTokens('mono');
    expect(STUDIO_TEMPLATES).toContain('mono');
    expect(resolveStudioAppearanceTemplate('mono')).toBe('minimal');
    expect(monoTokens).toMatchObject({
      '--ww-background-color': 'var(--ww-ref-mono-canvas)',
      '--ww-theme-color': 'var(--ww-ref-mono-purple)',
      '--ww-radius-card': '28px',
      '--ww-card-shadow-floating': 'var(--ww-ref-mono-shadow-dock)',
      '--ww-color-finance-income': '52 199 89',
    });
    expect(createThemeCss('mono', monoTokens)).toContain('html[data-design-studio-template=\'mono\']');
  });

  it('creates a sanitised debug record only when explicitly requested', () => {
    const record = createStudioDebugRecord('mono', {
      '--ww-theme-color': '#765cff',
      '--ww-not-a-token': '#ffffff',
    }, '2026-09-04T16:35:00.000Z');
    expect(record).toMatchObject({
      label: 'MONO · 2026-09-04 16:35',
      template: 'mono',
      overrides: { '--ww-theme-color': '#765cff' },
    });
  });
});
