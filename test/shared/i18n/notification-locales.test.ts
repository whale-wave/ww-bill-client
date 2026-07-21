import { afterAll, describe, expect, it } from 'vitest';
import { changeLanguage, i18n } from '@/shared/i18n';

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('notification-center locales', () => {
  it('defines notification actions and types in Chinese and English', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('message.notificationCenter.markAllRead', { ns: 'common' }))
      .toBe('全部已读');
    expect(i18n.t('message.notificationCenter.retry', { ns: 'common' }))
      .toBe('重新加载');
    expect(i18n.t('message.notificationCenter.types.LEDGER_JOIN_REQUEST', { ns: 'common' }))
      .toBe('加入申请');

    await changeLanguage('en');
    expect(i18n.t('message.notificationCenter.markAllRead', { ns: 'common' }))
      .toBe('Mark all read');
    expect(i18n.t('message.notificationCenter.retry', { ns: 'common' }))
      .toBe('Try again');
    expect(i18n.t('message.notificationCenter.types.LEDGER_JOIN_REQUEST', { ns: 'common' }))
      .toBe('Join request');
  });
});
