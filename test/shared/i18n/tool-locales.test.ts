import { afterAll, describe, expect, it } from 'vitest';
import { changeLanguage, i18n } from '@/shared/i18n';

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('tool locales', () => {
  it('localizes invoice assistant empty and delete states', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('empty', { ns: 'invoice' })).toBe('还没有发票抬头');

    await changeLanguage('en');
    expect(i18n.t('deleteTitle', { ns: 'invoice' })).toBe('Delete invoice profile?');
  });

  it('localizes fixed expense empty and delete states', async () => {
    await changeLanguage('zh-CN');
    expect(i18n.t('deleteTitle', { ns: 'fixed-expense' })).toBe('删除固定支出？');

    await changeLanguage('en');
    expect(i18n.t('list.emptyDescription', { ns: 'fixed-expense' })).toContain('rent');
  });
});
