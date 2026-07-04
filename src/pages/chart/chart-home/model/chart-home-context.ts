import type { AmountType, TabItem, TimeRangeCategory } from '@/entities/chart';
import { createContext, useContext } from 'react';

export interface ChartHomeContextValue {
  currentAmountType: AmountType;
  currentTimeRangeCategory: TimeRangeCategory;
  tabActive: string;
  tabs: TabItem[];
  curTab?: TabItem;
  setTabActive: (key: string) => void;
  setCurrentTimeRangeCategory: (range: TimeRangeCategory) => void;
  setCurrentAmountType: (type: AmountType) => void;
}

export const ChartHomeContext = createContext<ChartHomeContextValue | null>(null);

export function useChartHome(): ChartHomeContextValue {
  const ctx = useContext(ChartHomeContext);
  if (!ctx)
    throw new Error('useChartHome must be used within ChartHomeProvider');
  return ctx;
}
