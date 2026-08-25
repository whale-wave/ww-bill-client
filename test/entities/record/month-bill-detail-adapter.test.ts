import { describe, expect, it } from 'vitest';
import { DEFAULT_MONTH_BILL_EXPORT_QR_URL, normalizeMonthBillDetail } from '@/entities/record/month-bill-detail';

const base = {
  achievement: { streakDays: 0, totalRecordDays: 0, totalRecordCount: 0 },
  expense: { averageDaily: '0.00', categories: [], categoryChanges: [], dailyTrend: [], highestDay: null, monthlyTrend: [] },
  income: { categories: [], monthlyTrend: [] },
  month: '2026-08',
  summary: { balance: '0.00', expense: '0.00', income: '0.00', recordCount: 0, recordDays: 0 },
};

describe('normalizeMonthBillDetail', () => {
  it('uses the default only when the wire field is absent', () => {
    expect(normalizeMonthBillDetail(base).monthBillExportQrUrl).toBe(DEFAULT_MONTH_BILL_EXPORT_QR_URL);
  });

  it.each(['', '   ', 'http://example.com', 'not-a-url'])('rejects a present invalid QR URL: %s', (value) => {
    expect(() => normalizeMonthBillDetail({ ...base, monthBillExportQrUrl: value })).toThrow();
  });

  it('trims a valid HTTPS URL', () => {
    expect(normalizeMonthBillDetail({ ...base, monthBillExportQrUrl: ' https://example.com/path ' }).monthBillExportQrUrl).toBe('https://example.com/path');
  });
});
