import type { PatchUserAppConfigBody } from '@/entities/user-app-config';
import { describe, expect, it } from 'vitest';
import {
  applyAppearancePreference,
  DEFAULT_APPEARANCE,
  isAppearanceTemplate,
  readAppearancePreference,
  resolveAppearanceTemplate,
} from '@/features/appearance';

const supportedPatch: PatchUserAppConfigBody = { appearanceTemplate: 'glass' };
// @ts-expect-error Appearance accent remains server compatibility data, not a v2 client mutation.
const unsupportedAccentPatch: PatchUserAppConfigBody = { appearanceAccent: 'sky' };
void supportedPatch;
void unsupportedAccentPatch;

describe('appearance preference', () => {
  it('uses the balanced liquid-glass theme package until account configuration arrives', () => {
    expect(readAppearancePreference()).toEqual({ template: 'glass' });
    expect(DEFAULT_APPEARANCE).toEqual({ template: 'glass' });
  });

  it('applies only the account template and clears a legacy accent attribute', () => {
    document.documentElement.dataset.appearanceAccent = 'lavender';
    applyAppearancePreference({ template: 'fresh' });

    expect(document.documentElement.dataset).toMatchObject({
      appearanceTemplate: 'fresh',
    });
    expect(document.documentElement.dataset.appearanceAccent).toBeUndefined();
  });

  it('only accepts registered visual templates', () => {
    expect(isAppearanceTemplate('minimal')).toBe(true);
    expect(isAppearanceTemplate('cartoon')).toBe(false);
  });

  it('does not let untrusted runtime values escape the supported template contract', () => {
    expect(resolveAppearanceTemplate('minimal')).toBe('minimal');
    expect(resolveAppearanceTemplate('cartoon')).toBe('glass');
  });

  it('does not let a legacy accent override its template package', () => {
    const legacyPreference = { appearanceAccent: 'coral', appearanceTemplate: 'glass' } as const;

    expect(readAppearancePreference(legacyPreference)).toEqual({
      template: 'glass',
    });
  });
});
