import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TimeRangeCategory = 'week' | 'month' | 'year';
export type AmountType = 'sub' | 'add';

interface State {
  tabActive: string;
  currentTimeRangeCategory: TimeRangeCategory;
  currentAmountType: AmountType;
}

interface Actions {
  setTabActive: (d: string) => void;
  setCurrentTimeRangeCategory: (d: TimeRangeCategory) => void;
  setCurrentAmountType: (d: AmountType) => void;
}

export const useChartStore = create<State & Actions>()(persist(set => ({
  tabActive: 'chart',
  currentTimeRangeCategory: 'week',
  currentAmountType: 'sub',
  setTabActive: (data) => {
    set({ tabActive: data });
  },
  setCurrentTimeRangeCategory: (data) => {
    set({ currentTimeRangeCategory: data });
  },
  setCurrentAmountType: (data) => {
    set({ currentAmountType: data });
  },
}), {
  name: 'chart-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: () => {
    // const { token, userInfo } = state;
    return {};
  },
}));
