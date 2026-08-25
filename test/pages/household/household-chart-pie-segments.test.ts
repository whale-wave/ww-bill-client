import type { ChartOverviewRankingItem } from '@/features/chart-overview';
import { describe, expect, it } from 'vitest';
import { mapHouseholdPieSegments } from '@/pages/household-charts/model/pie-segments';

function rankingItem(id: string, name: string, amount: string, percentage: string): ChartOverviewRankingItem {
  return {
    amount,
    category: { icon: 'bill', id, name },
    percentage,
    type: 'sub',
  };
}

describe('mapHouseholdPieSegments', () => {
  it('keeps up to four categories in server-provided order', () => {
    const segments = mapHouseholdPieSegments([
      rankingItem('food', '餐饮', '500.00', '50'),
      rankingItem('travel', '交通', '300.00', '30'),
    ], { otherLabel: '其他' });

    expect(segments).toEqual([
      { amount: '500.00', color: '#6fc2dc', key: 'category:food', name: '餐饮', percentage: '50' },
      { amount: '300.00', color: '#f0a0b8', key: 'category:travel', name: '交通', percentage: '30' },
    ]);
  });

  it('merges the fifth and later categories with exact amount and percentage sums', () => {
    const segments = mapHouseholdPieSegments([
      rankingItem('1', '一', '500.00', '50'),
      rankingItem('2', '二', '300.00', '30'),
      rankingItem('3', '三', '100.00', '10'),
      rankingItem('4', '四', '50.00', '5'),
      rankingItem('5', '五', '0.01', '0.01'),
      rankingItem('6', '六', '0.02', '0.02'),
    ], { otherLabel: '其他' });

    expect(segments).toHaveLength(5);
    expect(segments.at(-1)).toEqual({
      amount: '0.03',
      color: '#efbc70',
      key: 'aggregate:other',
      name: '其他',
      percentage: '0.03',
    });
  });

  it('namespaces category keys so a real other category cannot collide', () => {
    const segments = mapHouseholdPieSegments([
      rankingItem('other', '其他分类', '100.00', '80'),
      rankingItem('second', '第二类', '20.00', '20'),
      rankingItem('third', '第三类', '0.00', '0'),
      rankingItem('fourth', '第四类', '0.00', '0'),
      rankingItem('fifth', '第五类', '0.00', '0'),
    ], { otherLabel: '其他' });

    expect(segments.map(segment => segment.key)).toEqual([
      'category:other',
      'category:second',
      'category:third',
      'category:fourth',
      'aggregate:other',
    ]);
  });

  it('returns no segments for empty ranking', () => {
    expect(mapHouseholdPieSegments([], { otherLabel: '其他' })).toEqual([]);
  });
});
