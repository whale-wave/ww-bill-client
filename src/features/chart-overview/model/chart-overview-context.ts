import type { ReactNode } from 'react';
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
  displayLabel?: string;
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

export interface ChartOverviewPeriodTab {
  key: string;
  name: string;
}

export interface ChartOverviewRankingSection {
  items: ChartOverviewRankingItem[];
  key: string;
  title: string;
}

export type ChartOverviewMetric = AmountType | 'net';
export type ChartOverviewDisplay = 'line' | 'pie';

export interface ChartOverviewMetricOption {
  icon: string;
  label: string;
  value: ChartOverviewMetric;
}

export interface ChartOverviewContextValue {
  additionalRankingSections?: ChartOverviewRankingSection[];
  currentAmountType: AmountType;
  currentMetric?: ChartOverviewMetric;
  currentTimeRangeCategory: TimeRangeCategory;
  displayMode?: ChartOverviewDisplay;
  isAmountHidden?: boolean;
  metricOptions?: ChartOverviewMetricOption[];
  onMetricChange?: (metric: ChartOverviewMetric) => void;
  onRankingItemClick?: (item: ChartOverviewRankingItem) => void;
  rankingInteraction?: 'navigate' | 'none';
  rankingEmptyContent?: ReactNode;
  rankingTitle?: string;
  totalLabel?: string;
  totalTestId?: string;
  tabActive: string;
  tabs: ChartOverviewPeriodTab[];
  curTab?: ChartOverviewTab;
  isContentLoading?: boolean;
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
