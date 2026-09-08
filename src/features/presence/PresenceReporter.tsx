import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { reportPresence } from '@/entities/auth';
import { useAuthStore } from '@/features/auth';
import { captureRequestAuth } from '@/shared/api';

const PRESENCE_INTERVAL_MS = 45_000;

export function PresenceReporter() {
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (!token)
      return;

    const authContext = captureRequestAuth();
    let appIsActive = true;
    let hasReportedOnline = false;
    let intervalId: number | undefined;
    const isForeground = () => appIsActive && document.visibilityState === 'visible';
    const stopReporting = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };
    const reportOffline = () => {
      if (!hasReportedOnline)
        return;
      hasReportedOnline = false;
      void reportPresence('offline', authContext).catch(() => undefined);
    };
    const startReporting = () => {
      if (!isForeground() || intervalId !== undefined)
        return;
      hasReportedOnline = true;
      void reportPresence('online', authContext).catch(() => undefined);
      intervalId = window.setInterval(() => {
        void reportPresence('online', authContext).catch(() => undefined);
      }, PRESENCE_INTERVAL_MS);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startReporting();
      }
      else {
        reportOffline();
        stopReporting();
      }
    };
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      appIsActive = isActive;
      if (isForeground()) {
        startReporting();
      }
      else {
        reportOffline();
        stopReporting();
      }
    };

    startReporting();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const appListener = App.addListener('appStateChange', handleAppStateChange);
    return () => {
      reportOffline();
      stopReporting();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void appListener.then(listener => listener.remove());
    };
  }, [token]);

  return null;
}
