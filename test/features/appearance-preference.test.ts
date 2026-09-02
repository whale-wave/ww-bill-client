import { describe, expect, it } from 'vitest';
import {
  applyAppearancePreference,
  DEFAULT_APPEARANCE,
  isAppearanceAccent,
  isAppearanceTemplate,
  readAppearancePreference,
} from '@/features/appearance';

describe('appearance preference', () => {
  it('uses the existing fresh sky treatment until account configuration arrives', () => {
    expect(readAppearancePreference()).toEqual(DEFAULT_APPEARANCE);
  });

  it('applies account choices as document data attributes', () => {
    applyAppearancePreference({ accent: 'lavender', template: 'glass' });

    expect(document.documentElement.dataset).toMatchObject({
      appearanceAccent: 'lavender',
      appearanceTemplate: 'glass',
    });
  });

  it('only accepts registered templates and accent palettes', () => {
    expect(isAppearanceTemplate('minimal')).toBe(true);
    expect(isAppearanceTemplate('cartoon')).toBe(false);
    expect(isAppearanceAccent('mint')).toBe(true);
    expect(isAppearanceAccent('custom')).toBe(false);
  });
});
