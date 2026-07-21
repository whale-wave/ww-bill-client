import { afterAll, describe, expect, it } from 'vitest';
import { changeLanguage, i18n } from '@/shared/i18n';

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('ledger locales', () => {
  it('defines the six public template names in Chinese and English', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('template.business.name', { ns: 'ledger' })).toBe('生意账本');
    expect(i18n.t('template.micro-business.name', { ns: 'ledger' })).toBe('微商账本');

    await changeLanguage('en');
    expect(i18n.t('template.business.name', { ns: 'ledger' })).toBe('Business Ledger');
    expect(i18n.t('template.micro-business.name', { ns: 'ledger' })).toBe('Micro-business Ledger');
  });
});
