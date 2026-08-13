import { afterAll, describe, expect, it } from 'vitest';
import { changeLanguage, i18n } from '@/shared/i18n';

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('auth locales', () => {
  it('defines the complete authentication flow in Chinese and English', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('login.subtitle', { ns: 'auth' })).toContain('欢迎回来');
    expect(i18n.t('sign.captcha', { ns: 'auth' })).toBe('验证码');
    expect(i18n.t('forgetPassword.stepReset', { ns: 'auth' })).toContain('第 3 步');

    await changeLanguage('en');
    expect(i18n.t('login.subtitle', { ns: 'auth' })).toContain('Welcome back');
    expect(i18n.t('sign.captcha', { ns: 'auth' })).toBe('Verification Code');
    expect(i18n.t('forgetPassword.stepReset', { ns: 'auth' })).toContain('STEP 3');
  });

  it('uses a string-valued key for the visible captcha label', async () => {
    await changeLanguage('en');
    expect(i18n.t('sign.captcha', { ns: 'auth' })).toBeTypeOf('string');
    expect(i18n.t('sign.captcha', { ns: 'auth' })).not.toBe('captcha');
  });
});
