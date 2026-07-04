import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { queryClient } from '@/shared/api';

interface AuthState {
  token: string;
}

interface AuthActions {
  setToken: (token: string) => void;
  logOut: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(persist(set => ({
  token: '',
  setToken: (token) => {
    set({ token });
  },
  logOut: () => {
    set({ token: '' });
    localStorage.clear();
    void queryClient.clear();
  },
}), {
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({ token: state.token }),
}));
