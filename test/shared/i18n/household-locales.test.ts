import { afterAll, describe, expect, it } from 'vitest';
import { changeLanguage, i18n } from '@/shared/i18n';

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('household locales', () => {
  it('defines core privacy, policy and lifecycle copy in both languages', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('policy.PRIVATE', { ns: 'household' })).toBe('仅自己可见');
    expect(i18n.t('settings.dissolve', { ns: 'household' })).toBe('解散家庭账本');
    expect(i18n.t('export.title', { ns: 'household' })).toBe('导出家庭数据');

    await changeLanguage('en');
    expect(i18n.t('policy.PRIVATE', { ns: 'household' })).toBe('Only visible to me');
    expect(i18n.t('settings.dissolve', { ns: 'household' })).toBe('Dissolve household ledger');
    expect(i18n.t('export.title', { ns: 'household' })).toBe('Export household data');
  });
});
