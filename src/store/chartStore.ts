import { create } from 'zustand';

type State = {
  type: string;
  category: string;
  categoryId: number;
  categoryData: any[];
};

type Actions = {
  getChartData: (d: string) => void;
  setChartData: (d: any) => void;
  setType: (d: any) => void;
};

export const useChartStore = create<State & Actions>((set: any, get: any) => ({
  type: 'sub', //sub 支出，add 收入
  category: 'year', //类别 (week 按周 | month 按月 | year 按年)
  categoryId: 0, //类别id
  categoryData: [], //图表的数据和记账数据
  getChartData: (payload: any) => {
    console.log(payload, 'payload liang');
  },
  setChartData: (data: any) => {
    set({ categoryData: data });
    console.log(get().categoryData, 'categoryData liang');
  },
  setType: (payload: string) => {
    set({ type: payload });
  },
}));
