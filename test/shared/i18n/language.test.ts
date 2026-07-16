import { describe, expect, it } from 'vitest';
import { changeLanguage, detectLanguage, i18n } from '@/shared/i18n';

describe('language preference', () => {
  it('persists a language change for the next app load', async () => {
    await changeLanguage('en');

    expect(i18n.language).toBe('en');
    expect(detectLanguage()).toBe('en');
  });
});
