import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/i18n';
import { mapExportRecordToSheetRow } from '@/shared/lib/export-data';

describe('export data', () => {
  it('formats API-shaped creation and update timestamps into a sheet row', () => {
    const row = mapExportRecordToSheetRow({
      amount: '88.00',
      category: { id: 7, name: '餐饮' },
      createdAt: '2026-07-15 08:09:10',
      id: 42,
      remark: '午餐',
      time: '2026-07-14 12:30:00',
      type: 'sub',
      updatedAt: '2026-07-16 09:10:11',
    });

    expect(row[i18n.t('common:export.createdAt')]).toBe('2026-07-15 08:09:10');
    expect(row[i18n.t('common:export.updatedAt')]).toBe('2026-07-16 09:10:11');
  });
});
