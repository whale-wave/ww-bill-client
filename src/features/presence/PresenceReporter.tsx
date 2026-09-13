import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { disconnectAppSocket, getAppSocket } from '@/shared/api/socket';

export function PresenceReporter() {
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (!token) {
      disconnectAppSocket();
      return;
    }

    const socket = getAppSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket && !socket.connected) {
        socket.connect();
      }
    };

    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (isActive && document.visibilityState === 'visible' && socket && !socket.connected) {
        socket.connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const appListener = App.addListener('appStateChange', handleAppStateChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void appListener.then(listener => listener.remove());
    };
  }, [token]);

  return null;
}
