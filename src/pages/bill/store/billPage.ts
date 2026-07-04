import { create } from 'zustand';
import { BillTabsType } from '@/pages/bill/typs';

interface State {
  billTabType: BillTabsType;

  selectDate?: Date;
}

interface Actions {
  setBillTabTab: (tabType: BillTabsType) => void;
  getIsMonthTabType: () => boolean;

  setSelectDate: (date: Date) => void;
}

export const useBillPageStore = create<State & Actions>((set, get) => ({
  billTabType: BillTabsType.MONTH,
  getIsMonthTabType: () => get().billTabType === BillTabsType.MONTH,
  setBillTabTab: (data) => {
    set({ billTabType: data });
  },

  selectDate: undefined,
  setSelectDate: (date) => {
    set({ selectDate: date });
  },
}));
