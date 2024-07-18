import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface State {
  searchRecordKeyword: string;
}

interface Actions {
  setSearchRecordKeyword: (d: string) => void;
}

export const useRecordStore = create<State & Actions>()(persist(set => ({
  searchRecordKeyword: '',
  setSearchRecordKeyword: (data) => {
    set({ searchRecordKeyword: data });
  },
}), {
  name: 'record-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: () => {
    // const { token, userInfo } = state;
    return {};
  },
}));
