import type { ChartOverviewRankingItem } from '@/features/chart-overview';
import { HOUSEHOLD_PIE_COLORS } from '@/shared/config/household-pie-colors';
import { math } from '@/shared/lib';

export interface HouseholdPieSegment {
  key: string;
  name: string;
  amount: string;
  percentage: string;
  color: string;
}

interface MapHouseholdPieSegmentsOptions {
  otherLabel: string;
}

function formatPercentage(value: ReturnType<typeof math.add>) {
  return value.toFixed(2).replace(/\.?(0+)$/, '') || '0';
}

function createCategorySegment(item: ChartOverviewRankingItem, index: number): HouseholdPieSegment {
  return {
    amount: String(item.amount),
    color: HOUSEHOLD_PIE_COLORS[index] ?? HOUSEHOLD_PIE_COLORS.at(-1)!,
    key: `category:${String(item.category.id)}`,
    name: item.category.name,
    percentage: item.percentage,
  };
}

export function mapHouseholdPieSegments(
  ranking: ChartOverviewRankingItem[],
  { otherLabel }: MapHouseholdPieSegmentsOptions,
): HouseholdPieSegment[] {
  const topCategories = ranking.slice(0, 4).map(createCategorySegment);
  if (ranking.length <= 4)
    return topCategories;

  const remainingCategories = ranking.slice(4);
  const otherAmount = remainingCategories.reduce(
    (sum, item) => math.add(sum, item.amount),
    math.add(0, 0),
  );
  const otherPercentage = remainingCategories.reduce(
    (sum, item) => math.add(sum, item.percentage),
    math.add(0, 0),
  );

  return [
    ...topCategories,
    {
      amount: otherAmount.toFixed(2),
      color: HOUSEHOLD_PIE_COLORS[4],
      key: 'aggregate:other',
      name: otherLabel,
      percentage: formatPercentage(otherPercentage),
    },
  ];
}
