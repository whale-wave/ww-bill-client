import { describe, expect, it } from 'vitest';
import { flattenLocaleKeys } from '@/shared/i18n';
import en from '@/shared/i18n/locales/en/asset.json';
import zh from '@/shared/i18n/locales/zh-CN/asset.json';

describe('asset locales', () => {
  it('keeps Chinese and English locale keys aligned', () => {
    expect(flattenLocaleKeys(en).sort()).toEqual(flattenLocaleKeys(zh).sort());
  });

  it('includes the localized copy introduced by the redesigned asset flow', () => {
    expect(zh.detail.emptyRecords).toBe('本月暂无变动记录');
    expect(en.detail.emptyRecords).toBe('No changes this month');
    expect(zh.adjust.title).toBe('调整账户金额');
    expect(en.adjust.title).toBe('Adjust Account Amount');
  });
});
