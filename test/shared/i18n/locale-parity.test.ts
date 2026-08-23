import { describe, expect, it } from 'vitest';
import {
  clearMissingTranslationKeys,
  compareLocaleKeys,
  flattenLocaleKeys,
  getLocaleParity,
  getMissingTranslationKeys,
  i18n,
  resources,
} from '@/shared/i18n';

function isRawTranslationKey(value: string): boolean {
  return /^(?:[a-z][a-z0-9-]*:)?[a-z][\w-]*(?:\.[\w-]+)+$/i.test(value);
}

describe('locale parity', () => {
  it('keeps the complete nested key set aligned between Chinese and English', () => {
    expect(getLocaleParity()).toEqual({ extra: [], missing: [] });
    expect(compareLocaleKeys(resources['zh-CN'], resources.en)).toEqual({ extra: [], missing: [] });
  });

  it('translates the personal detail empty and error states in both supported languages', () => {
    for (const language of ['zh-CN', 'en'] as const) {
      expect(i18n.t('detail.errorTitle', { lng: language, ns: 'record' })).not.toBe('detail.errorTitle');
      expect(i18n.t('detail.errorDescription', { lng: language, ns: 'record' })).not.toBe('detail.errorDescription');
      expect(i18n.t('detail.errorAction', { lng: language, ns: 'record' })).not.toBe('detail.errorAction');
    }
  });

  it('does not render raw keys for any translated leaf', () => {
    for (const language of Object.keys(resources) as Array<keyof typeof resources>) {
      for (const [namespace, locale] of Object.entries(resources[language])) {
        for (const key of flattenLocaleKeys(locale as Record<string, unknown>)) {
          expect(isRawTranslationKey(i18n.t(key, { lng: language, ns: namespace }))).toBe(false);
        }
      }
    }
  });

  it('records missing keys and enables namespace/key tracking', () => {
    clearMissingTranslationKeys();
    expect(isRawTranslationKey(i18n.t('settings.__missing__', { ns: 'ledger' }))).toBe(true);
    expect(getMissingTranslationKeys()).toContain('ledger:settings.__missing__');
  });

  it('protects against settings.sub, ledger.*, and asset.* raw keys', () => {
    clearMissingTranslationKeys();
    // Verify valid keys exist and are translated
    expect(i18n.t('settings.preferences', { ns: 'ledger' })).not.toBe('settings.preferences');
    expect(i18n.t('settings.subtitle', { ns: 'ledger' })).not.toBe('settings.subtitle');
    expect(i18n.t('form.save', { ns: 'asset' })).not.toBe('form.save');

    // Verify non-existent sub key is flagged
    expect(i18n.t('settings.sub', { ns: 'ledger' })).toBe('settings.sub');
    expect(getMissingTranslationKeys()).toContain('ledger:settings.sub');
  });

  it('can clear test missing-key observations between checks', () => {
    clearMissingTranslationKeys();
    expect(getMissingTranslationKeys()).toEqual([]);
  });
});
