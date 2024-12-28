import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getWeek, isSameYear, subWeeks } from 'date-fns';
import type { GetChartApiResponseWeekData, GetChartApiResponseWeekDataWeekItem } from '@/api';

export type TimeRangeCategory = 'week' | 'month' | 'year';
export type AmountType = 'sub' | 'add';

export interface TabItem extends GetChartApiResponseWeekDataWeekItem {
  name: string;
  key: string;
}

interface State {
  tabActive: string;
  currentTimeRangeCategory: TimeRangeCategory;
  currentAmountType: AmountType;
  tabs: TabItem[];
  curTab?: TabItem;
}

interface Actions {
  setTabActive: (d: string) => void;
  setCurrentTimeRangeCategory: (d: TimeRangeCategory) => void;
  setCurrentAmountType: (d: AmountType) => void;
  setTabsByWeek: (d: GetChartApiResponseWeekData[]) => void;
  setTabsByMonth: (d: any[]) => void;
  setTabsByYear: (d: any[]) => void;
  setCurTab: (d: TabItem) => void;
}

export const useChartStore = create<State & Actions>()(persist((set, get) => ({
  tabActive: '',
  currentTimeRangeCategory: 'week',
  currentAmountType: 'sub',
  tabs: [],
  setTabActive: (data) => {
    const state = get();
    const curTab = state.tabs.find(tab => tab.key === data);
    set({ tabActive: data, curTab });
  },
  setCurTab: (data) => {
    set({ curTab: data });
  },
  setCurrentTimeRangeCategory: (data) => {
    set({ currentTimeRangeCategory: data });
  },
  setCurrentAmountType: (data) => {
    set({ currentAmountType: data });
  },
  setTabsByWeek: (data) => {
    const weekList = data.reduce((acc, weekDataItem) => {
      acc.push(...weekDataItem.data.map((weekItem) => {
        const now = new Date();
        const nowWeek = getWeek(now);
        const prevWeek = getWeek(subWeeks(now, 1));
        const isCurrentYear = isSameYear(now, new Date(String(`${weekDataItem.value}`)));
        let name = '';

        if (nowWeek === weekItem.value) {
          name = '本周';
        }
        else if (prevWeek === weekItem.value) {
          name = '上周';
        }
        else if (isCurrentYear) {
          name = `${weekItem.value}周`;
        }
        else {
          name = `${weekDataItem.value}-${weekItem.value}周`;
        }

        return {
          ...weekItem,
          name,
          key: `${weekDataItem.value}-${weekItem.value}`,
        };
      }));
      return acc;
    }, [] as TabItem[]);
    set({ tabs: weekList });
  },
  setTabsByMonth: (data) => {
    set({ tabs: data });
  },
  setTabsByYear: (data) => {
    set({ tabs: data });
  },
}), {
  name: 'chart-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: () => {
    // const { token, userInfo } = state;
    return {};
  },
}));
