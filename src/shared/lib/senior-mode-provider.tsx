import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applySeniorMode,
  getSeniorMode,
  SeniorModeContext,
  setSeniorMode,
} from './senior-mode-context';

export const SeniorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => getSeniorMode());
  const previousIsSeniorModeRef = useRef(isSeniorMode);

  useEffect(() => {
    applySeniorMode(isSeniorMode);

    if (previousIsSeniorModeRef.current !== isSeniorMode) {
      setSeniorMode(isSeniorMode);
      previousIsSeniorModeRef.current = isSeniorMode;
    }
  }, [isSeniorMode]);

  const toggleSeniorMode = useCallback(() => {
    setIsSeniorMode(previous => !previous);
  }, []);

  const value = useMemo(
    () => ({ isSeniorMode, toggleSeniorMode }),
    [isSeniorMode, toggleSeniorMode],
  );

  return (
    <SeniorModeContext.Provider value={value}>
      {children}
    </SeniorModeContext.Provider>
  );
};
