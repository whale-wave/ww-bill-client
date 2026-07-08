import { type FC, type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'app-senior-mode';

export function getSeniorMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setSeniorMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

/**
 * Toggle senior mode by adding/removing the `senior` class on <html>.
 * CSS variables in global.scss handle the actual font scaling:
 *   - :root defines normal font scale (xs/sm/base/lg/xl/2xl)
 *   - html.senior overrides all font variables to larger sizes
 * This approach scales both antd-mobile components AND Tailwind semantic classes
 * (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl) in one shot.
 */
export function applySeniorMode(enabled: boolean): void {
  document.documentElement.classList.toggle('senior', enabled);
}

interface SeniorModeContextValue {
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
}

const SeniorModeContext = createContext<SeniorModeContextValue>({
  isSeniorMode: false,
  toggleSeniorMode: () => {},
});

export const useSeniorMode = (): SeniorModeContextValue => useContext(SeniorModeContext);

export const SeniorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => getSeniorMode());

  // 页面首次加载时，根据 localStorage 应用 CSS 变量
  useEffect(() => {
    applySeniorMode(isSeniorMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSeniorMode = useCallback(() => {
    setIsSeniorMode((prev) => {
      const next = !prev;
      setSeniorMode(next);
      applySeniorMode(next);
      return next;
    });
  }, []);

  return (
    <SeniorModeContext.Provider value={{ isSeniorMode, toggleSeniorMode }}>
      {children}
    </SeniorModeContext.Provider>
  );
};
