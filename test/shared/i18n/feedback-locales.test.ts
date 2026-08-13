import { afterAll, describe, expect, it } from 'vitest';
import i18n from '@/shared/i18n/i18n';

afterAll(async () => i18n.changeLanguage('zh-CN'));

describe('feedback locales', () => {
  it.each([
    ['zh-CN', '意见反馈'],
    ['en', 'Feedback'],
  ])('provides the feedback form in %s', async (language, title) => {
    await i18n.changeLanguage(language);
    expect(i18n.t('title', { ns: 'feedback' })).toBe(title);
    expect(i18n.t('categories.bug', { ns: 'feedback' })).not.toContain('categories.');
    expect(i18n.t('successTitle', { ns: 'feedback' })).toBeTruthy();
  });
});
