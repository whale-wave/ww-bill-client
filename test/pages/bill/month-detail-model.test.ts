import type { MonthBillDetailResponse } from '@/entities/record';
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

const detail: MonthBillDetailResponse = {
  monthBillExportQrUrl: 'https://github.com/whale-wave/ww-bill-client',
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
};

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

  it('keeps a category color stable when its ranking position changes', () => {
    const first = {
      ...detail,
      expense: {
        ...detail.expense,
        categories: [
          { ...category(1, '20.00'), icon: 'catering' },
          { ...category(2, '10.00'), icon: 'housing' },
        ],
      },
    };
    const second = {
      ...first,
      expense: {
        ...first.expense,
        categories: [...first.expense.categories].reverse(),
      },
    };

    const firstModel = toMonthBillDetailModel(first);
    const secondModel = toMonthBillDetailModel(second);
    const firstColors = Object.fromEntries(firstModel.expense.chartCategories.map(item => [item.categoryId, item.color]));
    const secondColors = Object.fromEntries(secondModel.expense.chartCategories.map(item => [item.categoryId, item.color]));

    expect(firstColors[1]).toBe('#F2A65A');
    expect(firstColors[2]).toBe('#5F7FA3');
    expect(secondColors).toMatchObject(firstColors);
  });

  it('uses coordinated but distinct colors for visible custom categories', () => {
    const customDetail = {
      ...detail,
      expense: {
        ...detail.expense,
        categories: [101, 102, 103, 104, 105, 106].map(id => category(id, '10.00')),
      },
    };

    const model = toMonthBillDetailModel(customDetail);
    const colors = model.expense.chartCategories.map(item => item.color);

    expect(new Set(colors)).toHaveLength(colors.length);
  });

  it('resolves preferred-color and fallback collisions inside the visible segments', () => {
    const collisionDetail = {
      ...detail,
      expense: {
        ...detail.expense,
        categories: [
          { ...category(1, '10.00'), icon: 'financial' },
          { ...category(21, '10.00'), icon: 'motion' },
          category(41, '10.00'),
          category(61, '10.00'),
          { ...category(81, '10.00'), icon: 'other-money' },
          category(101, '10.00'),
        ],
      },
    };

    const model = toMonthBillDetailModel(collisionDetail);
    const colors = model.expense.chartCategories.map(item => item.color);

    expect(new Set(colors)).toHaveLength(colors.length);
  });
});
