import { describe, expect, it } from 'vitest';
import { toMonthBillDetailModel } from '@/pages/bill/month-detail/model/monthBillDetail';

function category(categoryId: number, amount: string) {
  return {
    amount,
    categoryId,
    name: `分类${categoryId}`,
    percentage: 10,
    sortOrder: categoryId,
  };
}

const detail = {
  achievement: { streakDays: 2, totalRecordCount: 4, totalRecordDays: 3 },
  expense: {
    averageDaily: '10.00',
    categories: [1, 2, 3, 4, 5, 6].map(id => category(id, '10.00')),
    categoryChanges: [],
    dailyTrend: [],
    highestDay: null,
    monthlyTrend: [],
  },
  income: { categories: [], monthlyTrend: [] },
  month: '2026-08',
  summary: { balance: '0.00', expense: '60.00', income: '60.00', recordCount: 4, recordDays: 3 },
} as const;

describe('toMonthBillDetailModel', () => {
  it('uses a stable aggregate key for categories after the fifth item', () => {
    const model = toMonthBillDetailModel(detail, 'Other');
    const aggregate = model.expense.chartCategories.at(-1);

    expect(aggregate).toMatchObject({
      amount: '10.00',
      key: 'aggregate:other',
      kind: 'aggregate',
      name: 'Other',
    });
    expect(model.expense.chartCategories).toHaveLength(6);
  });
});
