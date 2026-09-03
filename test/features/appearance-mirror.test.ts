import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APPEARANCE,
  readAppearancePreferenceMirror,
  resolveAppearanceTemplate,
  writeAppearancePreferenceMirror,
} from '@/features/appearance';

describe('appearance preference mirror', () => {
  it('falls back to glass for missing, corrupt, and unsupported values', () => {
    expect(resolveAppearanceTemplate(null)).toBe('glass');
    expect(resolveAppearanceTemplate('unknown-template')).toBe('glass');
    expect(readAppearancePreferenceMirror('42')).toEqual(DEFAULT_APPEARANCE);

    localStorage.setItem('ww:appearance:v2:42', '{not-json');
    expect(readAppearancePreferenceMirror('42')).toEqual(DEFAULT_APPEARANCE);
  });

  it('keeps each account preference in a separate local mirror', () => {
    writeAppearancePreferenceMirror('42', { template: 'minimal' });
    writeAppearancePreferenceMirror('43', { template: 'fresh' });

    expect(readAppearancePreferenceMirror('42')).toEqual({ template: 'minimal' });
    expect(readAppearancePreferenceMirror('43')).toEqual({ template: 'fresh' });
  });
});
