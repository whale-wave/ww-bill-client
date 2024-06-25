import { create } from 'zustand';

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

const userInfoStr = localStorage.getItem('userInfo');

export const useUserStore = create<State & Actions>((set, get) => ({
  token: localStorage.getItem('token') || '',
  userInfo: userInfoStr ? JSON.parse(userInfoStr) : undefined,
  setToken: (data) => {
    set({ token: data });
    localStorage.setItem('token', data);
  },
  setUserInfo: (data) => {
    set({ userInfo: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
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
  },
}));
