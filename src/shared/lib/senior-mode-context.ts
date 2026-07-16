import { createContext, useContext } from 'react';

const STORAGE_KEY = 'app-senior-mode';

export interface SeniorModeContextValue {
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
}

export const SeniorModeContext = createContext<SeniorModeContextValue>({
  isSeniorMode: false,
  toggleSeniorMode: () => {},
});

export function getSeniorMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setSeniorMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function applySeniorMode(enabled: boolean): void {
  document.documentElement.classList.toggle('senior', enabled);
}

export const useSeniorMode = (): SeniorModeContextValue => useContext(SeniorModeContext);
