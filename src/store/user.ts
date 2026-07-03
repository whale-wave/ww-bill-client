import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { queryClient } from '@/main';
import { useChartStore } from './chart';

interface UserInfo {
  id: number | string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  billRecord: {
    expend: number;
    income: number;
    month: number;
    surplus: number;
  };
  checkIn: boolean;
  checkInAll: number;
  checkInKeep: number;
  recordCount: number;
}

interface State {
  token: string;
  userInfo?: UserInfo;
}

interface Actions {
  setToken: (d: string) => void;
  setUserInfo: (d: UserInfo) => void;
  updateUserInfo: (d: { name: string; avatar: string }) => void;
  logOut: () => void;
}

export const useUserStore = create<State & Actions>()(persist((set, get) => ({
  token: '',
  userInfo: undefined,
  setToken: (data) => {
    set({ token: data });
  },
  setUserInfo: (data) => {
    set({ userInfo: data });
  },
  updateUserInfo: (data) => {
    const { name, avatar } = data;
    const userInfo = get().userInfo;
    if (userInfo) {
      set({ userInfo: { ...userInfo, name, avatar } });
    }
  },
  logOut: () => {
    set({
      token: '',
      userInfo: undefined,
    });
    localStorage.clear();
    void queryClient.clear();
    void useChartStore.getState().reset();
  },
}), {
  name: 'user-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => {
    const { token, userInfo } = state;
    return { token, userInfo };
  },
}));
