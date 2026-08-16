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

  it('localizes the template chooser heading and theme labels', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('templates.heading', { ns: 'ledger' })).toBe('找到适合你的账本');
    expect(i18n.t('settings.themeOptions.green', { ns: 'ledger' })).toBe('绿色');

    await changeLanguage('en');
    expect(i18n.t('templates.heading', { ns: 'ledger' })).toBe('Find the right ledger');
    expect(i18n.t('settings.themeOptions.green', { ns: 'ledger' })).toBe('Green');
  });

  it('localizes empty ledger states and record summaries', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('home.emptyDescription', { ns: 'ledger' })).toContain('还没有记录');
    expect(i18n.t('records.empty', { ns: 'ledger' })).toBe('当天暂无记录');

    await changeLanguage('en');
    expect(i18n.t('home.emptyDescription', { ns: 'ledger' })).toContain('No records yet');
    expect(i18n.t('records.searchSummary', {
      count: 2,
      expense: 8,
      income: 10,
      ns: 'ledger',
    })).toBe('2 records · Income 10 · Expense 8');
  });

  it('defines export progress copy in both languages', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('export.creating', { ns: 'ledger' })).toBe('正在创建…');
    expect(i18n.t('export.downloading', { ns: 'ledger' })).toBe('正在下载…');

    await changeLanguage('en');
    expect(i18n.t('export.creating', { ns: 'ledger' })).toBe('Creating…');
    expect(i18n.t('export.downloading', { ns: 'ledger' })).toBe('Downloading…');
  });
});
