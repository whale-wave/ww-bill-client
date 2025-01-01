import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getMonth, getWeek, getYear, isSameYear, subMonths, subWeeks, subYears } from 'date-fns';
import type { GetChartApiResponseMonthData, GetChartApiResponseMonthDataMonthItem, GetChartApiResponseWeekData, GetChartApiResponseWeekDataWeekItem, GetChartApiResponseYearData } from '@/api';

export type TimeRangeCategory = 'week' | 'month' | 'year';
export type AmountType = 'sub' | 'add';

export interface GetChartApiResponseWeekDataWeekItemTabItem extends GetChartApiResponseWeekDataWeekItem {
  name: string;
  key: string;
}

export interface GetChartApiResponseMonthDataMonthItemTabItem extends GetChartApiResponseMonthDataMonthItem {
  name: string;
  key: string;
}

export interface GetChartApiResponseYearDataYearItemTabItem extends GetChartApiResponseYearData {
  name: string;
  key: string;
}

export type TabItem = GetChartApiResponseWeekDataWeekItemTabItem | GetChartApiResponseMonthDataMonthItemTabItem | GetChartApiResponseYearDataYearItemTabItem;

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
  setTabsByMonth: (d: GetChartApiResponseMonthData[]) => void;
  setTabsByYear: (d: GetChartApiResponseYearData[]) => void;
  setCurTab: (d: TabItem) => void;
  reset: () => void;
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
    const monthList = data.reduce((acc, monthDataItem) => {
      acc.push(...monthDataItem.data.map((monthItem) => {
        const now = new Date();
        const nowMonth = getMonth(now) + 1;
        const prevMonth = getMonth(subMonths(now, 1)) + 1;
        const isCurrentYear = isSameYear(now, new Date(`${monthDataItem.value}`));
        let name = '';

        if (isCurrentYear) {
          if (nowMonth === monthItem.value) {
            name = '本月';
          }
          else if (prevMonth === monthItem.value) {
            name = '上月';
          }
          else {
            name = `${monthItem.value}月`;
          }
        }
        else {
          name = `${monthDataItem.value}-${monthItem.value}月`;
        }

        return {
          ...monthItem,
          name,
          key: `${monthDataItem.value}-${monthItem.value}`,
        };
      }));
      return acc;
    }, [] as TabItem[]);
    set({ tabs: monthList });
  },
  setTabsByYear: (data) => {
    const yearList = data.map((yearDataItem) => {
      const now = new Date();
      const nowYear = getYear(now);
      const prevYear = getYear(subYears(now, 1));
      let name = '';

      if (yearDataItem.value === nowYear) {
        name = '今年';
      }
      else if (yearDataItem.value === prevYear) {
        name = '去年';
      }
      else {
        name = `${yearDataItem.value}年`;
      }

      return {
        ...yearDataItem,
        name,
        key: `${yearDataItem.value}`,
      } as TabItem;
    });
    set({ tabs: yearList });
  },
  reset: () => {
    set({
      tabActive: '',
      currentTimeRangeCategory: 'week',
      currentAmountType: 'sub',
      tabs: [],
      curTab: undefined,
    });
  },
}), {
  name: 'chart-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: () => {
    // const { token, userInfo } = state;
    return {};
  },
}));
