import type { MonthBillCategoryAmount, MonthBillDetailResponse } from '@/entities/record';
import { math } from '@/shared/lib';

export interface MonthBillCategorySegment extends MonthBillCategoryAmount {
  key: string;
  kind: 'category' | 'aggregate';
}

export function toMonthBillDetailModel(data: MonthBillDetailResponse, otherLabel = '其他') {
  return {
    ...data,
    expense: {
      ...data.expense,
      chartCategories: toChartSegments(data.expense.categories, otherLabel),
    },
    income: {
      ...data.income,
      chartCategories: toChartSegments(data.income.categories, otherLabel),
    },
  };
}

function toChartSegments(categories: MonthBillCategoryAmount[], otherLabel: string): MonthBillCategorySegment[] {
  const visible = categories.slice(0, 5).map(category => ({
    ...category,
    key: `category:${category.categoryId}`,
    kind: 'category' as const,
  }));
  const otherAmount = categories.slice(5).reduce((total, category) => math.add(total, category.amount), math.add(0, 0));
  if (math.compare(otherAmount, 0) <= 0)
    return visible;

  const total = categories.reduce((sum, category) => math.add(sum, category.amount), math.add(0, 0));
  const percentage = math.compare(total, 0) > 0
    ? Number(math.multiply(math.divide(otherAmount, total), 100).toFixed(1))
    : 0;
  return [
    ...visible,
    {
      amount: otherAmount.toFixed(2),
      categoryId: 0,
      icon: undefined,
      key: 'aggregate:other',
      kind: 'aggregate' as const,
      name: otherLabel,
      percentage,
      sortOrder: Number.MAX_SAFE_INTEGER,
    },
  ];
}

export function formatMonthTitle(month: string) {
  const [year, monthNumber] = month.split('-');
  return `${year}年${Number(monthNumber)}月账单`;
}
