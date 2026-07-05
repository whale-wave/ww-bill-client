import type { AmountType, GetChartApiParamsCategory, GetChartApiResponse, GetChartApiResponseRankingData, TabItem, TimeRangeCategory } from '@/entities/chart';
import type { RecordEntry } from '@/entities/record';
import { isMonthData, isWeekData, isYearData } from '@/entities/chart';
import { math } from '@/shared/lib';

export const amountTypeName: Record<AmountType, string> = { sub: '支出', add: '收入' };
export const timeRangeName: Record<TimeRangeCategory, string> = { week: '周', month: '月', year: '年' };

export interface ChartCategoryLocationState {
  rankingItem?: GetChartApiResponseRankingData;
  tabKey?: string;
  tabName?: string;
  amountType?: AmountType;
  timeRangeCategory?: TimeRangeCategory;
  curTab?: TabItem;
}

export interface PeriodInfo {
  key: string;
  name: string;
  amount: number;
  average?: string;
  ranking?: GetChartApiResponseRankingData[];
  records: RecordEntry[];
}

export function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}

export function isTimeRangeCategory(value: string | null): value is GetChartApiParamsCategory {
  return value === 'week' || value === 'month' || value === 'year';
}

export function flattenRecords(data: unknown): RecordEntry[] {
  if (!Array.isArray(data))
    return [];
  return data.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('data' in item))
      return [];
    const itemData = (item as { data?: unknown }).data;
    if (!Array.isArray(itemData))
      return [];
    return itemData.filter((record): record is RecordEntry =>
      !!record && typeof record === 'object' && 'id' in record && 'category' in record,
    );
  });
}

export function getRecordsAmount(records: RecordEntry[]): number {
  return records.reduce((sum, record) => math.add(sum, record.amount).toNumber(), 0);
}

export function getPeriodsFromData(data: GetChartApiResponse, category: TimeRangeCategory): PeriodInfo[] {
  if (category === 'week' && isWeekData(data)) {
    return data.flatMap(yearItem => yearItem.data.map(weekItem => ({
      key: `${yearItem.value}-${weekItem.value}`,
      name: `${yearItem.value}年第${weekItem.value}周`,
      amount: weekItem.amount,
      average: weekItem.average,
      ranking: weekItem.ranking,
      records: flattenRecords(weekItem.data),
    })));
  }
  if (category === 'month' && isMonthData(data)) {
    return data.flatMap(yearItem => yearItem.data.map(monthItem => ({
      key: `${yearItem.value}-${monthItem.value}`,
      name: `${yearItem.value}年${monthItem.value}月`,
      amount: monthItem.amount,
      average: monthItem.average,
      ranking: monthItem.ranking,
      records: flattenRecords(monthItem.data),
    })));
  }
  if (category === 'year' && isYearData(data)) {
    return data.map(yearItem => ({
      key: `${yearItem.value}`,
      name: `${yearItem.value}年`,
      amount: yearItem.amount,
      average: yearItem.average,
      ranking: yearItem.ranking,
      records: flattenRecords(yearItem.data),
    }));
  }
  return [];
}

export function getPeriodFromState(state: ChartCategoryLocationState | null): PeriodInfo | undefined {
  if (!state?.curTab)
    return undefined;
  return {
    key: state.curTab.key,
    name: state.tabName || state.curTab.name,
    amount: state.curTab.amount,
    average: 'average' in state.curTab ? state.curTab.average : undefined,
    ranking: state.curTab.ranking,
    records: flattenRecords(state.curTab.data),
  };
}

export function getMatchedRouteState(state: ChartCategoryLocationState | null, context: {
  categoryId: string;
  type: AmountType;
  category: TimeRangeCategory;
  tabKey: string | null;
}): ChartCategoryLocationState | undefined {
  if (!state?.rankingItem)
    return undefined;
  if (String(state.rankingItem.category.id) !== context.categoryId)
    return undefined;
  if (state.amountType && state.amountType !== context.type)
    return undefined;
  if (state.timeRangeCategory && state.timeRangeCategory !== context.category)
    return undefined;
  if (state.tabKey && state.curTab?.key && state.tabKey !== state.curTab.key)
    return undefined;
  const stateTabKey = state.tabKey || state.curTab?.key;
  if (stateTabKey && context.tabKey && stateTabKey !== context.tabKey)
    return undefined;
  return state;
}
