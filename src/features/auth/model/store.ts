import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { queryClient, removeQueryCache } from '@/shared/api';

interface AuthState {
  token: string;
  userId: string;
}

interface AuthActions {
  startSession: (token: string, userId: string) => void;
  setUserId: (userId: string) => void;
  setToken: (token: string) => void;
  logOut: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(persist(set => ({
  token: '',
  userId: '',
  startSession: (token, userId) => {
    const previousUserId = useAuthStore.getState().userId;
    if (previousUserId && previousUserId !== userId) {
      void removeQueryCache(previousUserId);
      void queryClient.clear();
    }
    set({ token, userId });
  },
  setUserId: userId => set({ userId }),
  setToken: (token) => {
    set({ token });
  },
  logOut: () => {
    const userId = useAuthStore.getState().userId;
    set({ token: '', userId: '' });
    void removeQueryCache(userId);
    void queryClient.clear();
  },
}), {
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({ token: state.token, userId: state.userId }),
}));
