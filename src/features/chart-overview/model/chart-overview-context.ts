import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import type { RecordEntry } from '@/entities/record';
import { createContext, useContext } from 'react';

export interface ChartOverviewRankingItem {
  amount: number | string;
  category: {
    icon: string;
    id: number | string;
    name: string;
  };
  percentage: string;
  type: AmountType;
}

export interface ChartOverviewPoint {
  amount: number | string;
  data: RecordEntry[];
  tooltipMode?: 'aggregate';
  value: string;
}

export interface ChartOverviewTab {
  amount: number | string;
  average: string;
  data: ChartOverviewPoint[];
  key: string;
  name: string;
  ranking: ChartOverviewRankingItem[];
}

export interface ChartOverviewRankingSection {
  items: ChartOverviewRankingItem[];
  key: string;
  title: string;
}

export interface ChartOverviewContextValue {
  additionalRankingSections?: ChartOverviewRankingSection[];
  currentAmountType: AmountType;
  currentTimeRangeCategory: TimeRangeCategory;
  onRankingItemClick?: (item: ChartOverviewRankingItem) => void;
  rankingInteraction?: 'navigate' | 'none';
  rankingTitle?: string;
  tabActive: string;
  tabs: ChartOverviewTab[];
  curTab?: ChartOverviewTab;
  setTabActive: (key: string) => void;
  setCurrentTimeRangeCategory: (range: TimeRangeCategory) => void;
  setCurrentAmountType: (type: AmountType) => void;
}

export const ChartOverviewContext = createContext<ChartOverviewContextValue | null>(null);

export function useChartOverview(): ChartOverviewContextValue {
  const ctx = useContext(ChartOverviewContext);
  if (!ctx)
    throw new Error('useChartOverview must be used within ChartOverviewContext');
  return ctx;
}
