import { create } from 'zustand';

type State = {
  moneyType: string;
  categoryData: any[];
};

type Actions = {
  getChartData: (d: string) => void;
  setChartData: (d: any) => void;
};

export const useChartStore = create<State & Actions>((set: any, get: any) => ({
  moneyType: 'sub', //sub 支出，add 收入
  categoryData: [], //图表的数据和记账数据
  getChartData: (payload: any) => {
    console.log(payload, 'payload liang');
  },
  setChartData: (data: any) => {
    set({ categoryData: data });
    console.log(get().categoryData, 'categoryData liang');
  },
}));
