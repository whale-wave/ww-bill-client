import type { QueryClient } from '@tanstack/react-query';
import type { AccountQueryPersister } from '@/shared/api/query-persister';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearSessionScopedCaches } from '@/shared/api/auth-injection';
import { createQueryClient } from '@/shared/api/query-client';
import { createQueryCachePersister, createSessionLease } from '@/shared/api/query-persister';

export interface SessionRuntime {
  sessionEpoch: number;
  credentialRevision: number;
  lease: ReturnType<typeof createSessionLease>;
  queryClient: QueryClient;
  userId?: string;
  persister?: AccountQueryPersister;
  persistenceBindingRevision: number;
}
export interface AuthTransitionMarker { sessionEpoch: number; credentialRevision: number }
interface AuthState { token: string; userId: string; runtime: SessionRuntime }
interface AuthActions {
  startSession: (token: string, userId: string) => SessionRuntime;
  bindSessionUserId: (userId: string) => SessionRuntime;
  updateCredential: (token: string) => SessionRuntime;
  logOut: () => AuthTransitionMarker;
  bootstrapSessionRuntime: () => SessionRuntime;
}

function createRuntime(sessionEpoch: number, credentialRevision: number, userId?: string, bindingRevision = 0): SessionRuntime {
  return {
    sessionEpoch,
    credentialRevision,
    lease: createSessionLease(),
    queryClient: createQueryClient(),
    userId,
    persister: userId ? createQueryCachePersister(userId) : undefined,
    persistenceBindingRevision: bindingRevision,
  };
}
const initialRuntime = createRuntime(0, 0);

export const useAuthStore = create<AuthState & AuthActions>()(persist((set, get) => ({
  token: '',
  userId: '',
  runtime: initialRuntime,
  startSession: (token, userId) => {
    const previous = get();
    previous.runtime.lease.invalidate();
    void previous.runtime.persister?.terminate(previous.userId && previous.userId === userId ? 'retain' : 'remove');
    clearSessionScopedCaches();
    const runtime = createRuntime(previous.runtime.sessionEpoch + 1, 0, userId);
    set({ token, userId, runtime });
    return runtime;
  },
  bindSessionUserId: (userId) => {
    const current = get();
    if (current.runtime.userId) {
      if (current.runtime.userId !== userId)
        throw new Error('Session user is already bound; start a new session');
      return current.runtime;
    }
    const runtime = { ...current.runtime, userId, persister: createQueryCachePersister(userId), persistenceBindingRevision: current.runtime.persistenceBindingRevision + 1 };
    set({ userId, runtime });
    return runtime;
  },
  updateCredential: (token) => {
    const current = get();
    if (current.token === token)
      return current.runtime;
    const runtime = { ...current.runtime, credentialRevision: current.runtime.credentialRevision + 1 };
    set({ token, runtime });
    return runtime;
  },
  logOut: () => {
    const previous = get();
    previous.runtime.lease.invalidate();
    void previous.runtime.persister?.terminate('remove');
    clearSessionScopedCaches();
    const runtime = createRuntime(previous.runtime.sessionEpoch + 1, 0);
    set({ token: '', userId: '', runtime });
    return { sessionEpoch: runtime.sessionEpoch, credentialRevision: runtime.credentialRevision };
  },
  bootstrapSessionRuntime: () => {
    const current = get();
    if (!current.token || current.runtime.sessionEpoch !== 0)
      return current.runtime;
    const runtime = createRuntime(1, 0, current.userId || undefined);
    set({ runtime });
    return runtime;
  },
}), {
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
  partialize: state => ({ token: state.token, userId: state.userId }),
}));

export async function rehydrateAuthStore() {
  await useAuthStore.persist.rehydrate();
  return useAuthStore.getState().bootstrapSessionRuntime();
}
