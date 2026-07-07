import { type FC, type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'app-senior-mode';

/** 老人模式字号 */
const SENIOR_FONT_SIZE = '20px';
/** 正常字号 */
const NORMAL_FONT_SIZE = '15px';

export function getSeniorMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setSeniorMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

/**
 * 根据开关状态修改全局 --ww-font-size CSS 变量。
 * antd-mobile 组件和全局样式均引用此变量，修改后即可实现全局字体缩放。
 */
export function applySeniorMode(enabled: boolean): void {
  document.documentElement.style.setProperty(
    '--ww-font-size',
    enabled ? SENIOR_FONT_SIZE : NORMAL_FONT_SIZE,
  );
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
