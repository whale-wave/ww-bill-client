import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type AppLockEntryMode = 'required-setup' | 'management' | 'recovery';

export interface AppLockRuntimeContextValue {
  completeSetup: () => void;
  isRuntimeUnlocked: boolean;
}

export const AppLockRuntimeContext = createContext<AppLockRuntimeContextValue | null>(null);

export function useAppLockRuntime(): AppLockRuntimeContextValue {
  return useContext(AppLockRuntimeContext) ?? {
    completeSetup: () => undefined,
    isRuntimeUnlocked: false,
  };
}

export interface AppLockRuntimeProviderProps {
  children: ReactNode;
  value: AppLockRuntimeContextValue;
}
