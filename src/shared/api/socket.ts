import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/features/auth';
import { getClientDeviceHeaders } from './client-device';

let socketInstance: Socket | null = null;

function getSocketHost(): string {
  const viteHost = import.meta.env.VITE_HOST;
  if (typeof viteHost === 'string' && viteHost.trim().length > 0)
    return viteHost;
  if (typeof window !== 'undefined')
    return window.location.origin;
  return '';
}

export function getAppSocket(): Socket | null {
  const token = useAuthStore.getState().token;
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (socketInstance) {
    if (!socketInstance.connected && !socketInstance.active)
      socketInstance.connect();
    return socketInstance;
  }

  const socketHost = getSocketHost();
  socketInstance = io(socketHost, {
    auth: (callback) => {
      void getClientDeviceHeaders().then(device => callback({
        token: `Bearer ${token}`,
        ...(device ? { clientPlatform: device.platform, deviceModel: device.model, osVersion: device.osVersion } : {}),
      }));
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
}

export function disconnectAppSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
