import type { FC } from 'react';
import type { AppLockRuntimeProviderProps } from './runtime';
import { AppLockRuntimeContext } from './runtime';

export const AppLockRuntimeProvider: FC<AppLockRuntimeProviderProps> = ({ children, value }) => (
  <AppLockRuntimeContext.Provider value={value}>{children}</AppLockRuntimeContext.Provider>
);
