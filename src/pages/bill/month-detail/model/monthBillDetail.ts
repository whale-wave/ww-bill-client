import type { MonthBillCategoryAmount, MonthBillDetailResponse } from '@/entities/record';
import { math } from '@/shared/lib';

export interface MonthBillCategorySegment extends MonthBillCategoryAmount {
  key: string;
  kind: 'category' | 'aggregate';
  color: string;
}

export interface ExportUserSnapshot {
  displayName: string;
  avatar?: string;
}

export interface ExportCopySnapshot {
  monthTitle: string;
  reviewSubtitle: string;
}

export type AvatarReadyState = 'image-ready' | 'fallback-ready';

export const MONTH_BILL_CHART_COLORS = [
  '#5BB9D5',
  '#7C83E6',
  '#EC7FA3',
  '#35B89A',
  '#F2A65A',
  '#9B7EDE',
  '#E06C75',
  '#7FB069',
  '#D6A84B',
  '#4F9DA6',
  '#B07AA1',
  '#6C9BD2',
  '#D9825B',
  '#85A85A',
  '#C66FB0',
  '#5EAAA8',
  '#E3957A',
  '#8E8CD8',
  '#79A9C9',
  '#AA8F66',
  '#5F7FA3',
] as const;

export const MONTH_BILL_CATEGORY_COLOR_MAP: Readonly<Record<string, string>> = {
  'alcohol': '#AA8F66',
  'beauty': '#EC7FA3',
  'book': '#7C83E6',
  'cash-gift': '#C66FB0',
  'cash-gift-income': '#E06C75',
  'cars': '#5EAAA8',
  'catering': '#F2A65A',
  'children': '#D6A84B',
  'communication': '#4F9DA6',
  'daily': '#5BB9D5',
  'digital': '#6C9BD2',
  'donation': '#85A85A',
  'elder': '#7FB069',
  'entertainment': '#9B7EDE',
  'express': '#79A9C9',
  'financial': '#35B89A',
  'fress': '#B07AA1',
  'fruits': '#E06C75',
  'furniture': '#D9825B',
  'housing': '#5F7FA3',
  'medical': '#E3957A',
  'motion': '#35B89A',
  'office': '#8E8CD8',
  'other-money': '#8796A5',
  'part-time': '#9B7EDE',
  'pet': '#79A9C9',
  'repair': '#AA8F66',
  'shopping': '#7C83E6',
  'snacks': '#D6A84B',
  'socializing': '#C66FB0',
  'salary': '#35B89A',
  'red-envelope': '#E06C75',
  'study': '#6C9BD2',
  'traffic': '#5BB9D5',
  'travel': '#5EAAA8',
  'vegetables': '#7FB069',
} as const;

const AGGREGATE_OTHER_COLOR = '#8796A5';

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
  const visibleCategories = categories.slice(0, 5);
  const visibleColors = resolveVisibleCategoryColors(visibleCategories);
  const visible = visibleCategories.map(category => ({
    ...category,
    key: `category:${category.categoryId}`,
    kind: 'category' as const,
    color: visibleColors.get(category.categoryId)!,
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
      color: AGGREGATE_OTHER_COLOR,
    },
  ];
}

function resolveCategoryColor(category: MonthBillCategoryAmount) {
  const iconKey = category.icon?.trim().toLowerCase();
  if (iconKey && MONTH_BILL_CATEGORY_COLOR_MAP[iconKey])
    return MONTH_BILL_CATEGORY_COLOR_MAP[iconKey];
  const stableIndex = Math.abs(category.categoryId) % MONTH_BILL_CHART_COLORS.length;
  return MONTH_BILL_CHART_COLORS[stableIndex];
}

function resolveVisibleCategoryColors(categories: MonthBillCategoryAmount[]) {
  const colors = new Map<number, string>();
  const usedColors = new Set([AGGREGATE_OTHER_COLOR]);
  [...categories].sort((left, right) => left.categoryId - right.categoryId).forEach((category) => {
    const preferredColor = resolveCategoryColor(category);
    const preferredIndex = MONTH_BILL_CHART_COLORS.indexOf(preferredColor as typeof MONTH_BILL_CHART_COLORS[number]);
    const startIndex = preferredIndex >= 0
      ? preferredIndex
      : Math.abs(category.categoryId) % MONTH_BILL_CHART_COLORS.length;
    const color = Array.from({ length: MONTH_BILL_CHART_COLORS.length }, (_, offset) => (
      MONTH_BILL_CHART_COLORS[(startIndex + offset) % MONTH_BILL_CHART_COLORS.length]
    )).find(candidate => !usedColors.has(candidate)) ?? preferredColor;
    colors.set(category.categoryId, color);
    usedColors.add(color);
  });
  return colors;
}

export function formatMonthTitle(month: string) {
  const [year, monthNumber] = month.split('-');
  return `${year}年${Number(monthNumber)}月账单`;
}

export function getAvatarInitial(displayName: string) {
  const value = displayName.trim();
  if (!value)
    return '?';
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const Segmenter = Intl.Segmenter;
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });
    return segmenter.segment(value)[Symbol.iterator]().next().value?.segment ?? '?';
  }
  return Array.from(value)[0] ?? '?';
}

export interface MonthBillRingSegment {
  key: string;
  color: string;
  percentage: number;
}

export function getMonthBillRingSegments(categories: MonthBillCategorySegment[]): MonthBillRingSegment[] {
  const amounts = categories.map(item => Number(item.amount)).map(amount => Number.isFinite(amount) && amount > 0 ? amount : 0);
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total <= 0)
    return [];
  return categories.map((item, index) => ({
    color: item.color,
    key: item.key,
    percentage: amounts[index] / total * 100,
  }));
}
