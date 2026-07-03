import { create } from 'zustand';

interface State {
  searchRecordKeyword: string;
}

interface Actions {
  setSearchRecordKeyword: (d: string) => void;
}

export const useRecordStore = create<State & Actions>()(set => ({
  searchRecordKeyword: '',
  setSearchRecordKeyword: (data) => {
    set({ searchRecordKeyword: data });
  },
}));
