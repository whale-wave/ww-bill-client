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
  return /^(?:asset|ledger|settings|common)[:.]\S+/.test(value);
}

describe('locale parity', () => {
  it('keeps the complete nested key set aligned between Chinese and English', () => {
    expect(getLocaleParity()).toEqual({ extra: [], missing: [] });
    expect(compareLocaleKeys(resources['zh-CN'], resources.en)).toEqual({ extra: [], missing: [] });
  });

  it('does not render raw keys for any translated leaf', () => {
    for (const [namespace, locale] of Object.entries(resources['zh-CN'])) {
      for (const key of flattenLocaleKeys(locale as Record<string, unknown>)) {
        expect(isRawTranslationKey(i18n.t(key, { lng: 'zh-CN', ns: namespace }))).toBe(false);
      }
    }
  });

  it('records missing keys in the test environment before they can enter the UI', () => {
    clearMissingTranslationKeys();
    expect(isRawTranslationKey(i18n.t('settings.__missing__', { ns: 'ledger' }))).toBe(true);
    expect(getMissingTranslationKeys()).toContain('ledger:settings.__missing__');
  });

  it('can clear test missing-key observations between checks', () => {
    clearMissingTranslationKeys();
    expect(getMissingTranslationKeys()).toEqual([]);
  });
});
