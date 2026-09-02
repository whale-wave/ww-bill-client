import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { reportPresence } from '@/entities/auth/api';
import { useAuthStore } from '@/features/auth';

const PRESENCE_INTERVAL_MS = 45_000;

export function PresenceReporter() {
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (!token)
      return;

    let appIsActive = true;
    let intervalId: number | undefined;
    const isForeground = () => appIsActive && document.visibilityState === 'visible';
    const stopReporting = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };
    const startReporting = () => {
      if (!isForeground() || intervalId !== undefined)
        return;
      void reportPresence().catch(() => undefined);
      intervalId = window.setInterval(() => {
        void reportPresence().catch(() => undefined);
      }, PRESENCE_INTERVAL_MS);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        startReporting();
      else
        stopReporting();
    };
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      appIsActive = isActive;
      if (isForeground())
        startReporting();
      else
        stopReporting();
    };

    startReporting();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const appListener = App.addListener('appStateChange', handleAppStateChange);
    return () => {
      stopReporting();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void appListener.then(listener => listener.remove());
    };
  }, [token]);

  return null;
}
