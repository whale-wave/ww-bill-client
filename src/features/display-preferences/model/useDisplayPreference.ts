import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/features/auth';

const PREFIX = 'ww:display-preference:v1:';
const listeners = new Map<string, Set<() => void>>();
const memory = new Map<string, boolean>();

function read(key: string): boolean | undefined {
  try {
    const value = localStorage.getItem(key);
    if (value === 'true' || value === 'false')
      return value === 'true';
  }
  catch {
    // Keep the current session usable when device storage is unavailable.
  }
  return memory.get(key);
}

function notify(key: string) {
  listeners.get(key)?.forEach(listener => listener());
}

function write(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
    memory.delete(key);
  }
  catch {
    // The in-memory value remains available for this session.
    memory.set(key, value);
  }
  notify(key);
}

function subscribe(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set<() => void>();
  set.add(listener);
  listeners.set(key, set);
  return () => {
    set.delete(listener);
    if (set.size === 0)
      listeners.delete(key);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(PREFIX))
      return;
    memory.delete(event.key);
    notify(event.key);
  });
}

export function useDisplayPreference(
  scope: string,
  setting: string,
  legacyValue?: boolean,
  defaultValue = false,
) {
  const userId = useAuthStore(state => state.userId);
  const key = `${PREFIX}${encodeURIComponent(userId || 'device')}:${scope}:${setting}`;
  const value = useSyncExternalStore(
    useCallback(listener => subscribe(key, listener), [key]),
    useCallback(() => read(key) ?? legacyValue ?? defaultValue, [defaultValue, key, legacyValue]),
    () => defaultValue,
  );

  useEffect(() => {
    if (legacyValue !== undefined && read(key) === undefined)
      write(key, legacyValue);
  }, [key, legacyValue]);

  const setValue = useCallback((next: boolean) => {
    write(key, next);
  }, [key]);

  return [value, setValue] as const;
}
