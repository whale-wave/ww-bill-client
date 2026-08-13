import { describe, expect, it } from 'vitest';
import en from '@/shared/i18n/locales/en/asset.json';
import zh from '@/shared/i18n/locales/zh-CN/asset.json';

function flatten(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flatten(child as Record<string, unknown>, path)
      : [path];
  });
}

describe('asset locales', () => {
  it('keeps Chinese and English locale keys aligned', () => {
    expect(flatten(en).sort()).toEqual(flatten(zh).sort());
  });

  it('includes the localized copy introduced by the redesigned asset flow', () => {
    expect(zh.detail.emptyRecords).toBe('本月暂无变动记录');
    expect(en.detail.emptyRecords).toBe('No changes this month');
    expect(zh.adjust.title).toBe('调整账户金额');
    expect(en.adjust.title).toBe('Adjust Account Amount');
  });
});
