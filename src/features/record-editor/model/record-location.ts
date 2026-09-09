import type { RecordLocation } from '@/entities/record';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type RecordLocationErrorReason
  = | 'permission-denied'
    | 'services-disabled'
    | 'timeout'
    | 'unavailable'
    | 'unknown';

export class RecordLocationRequestError extends Error {
  constructor(public readonly reason: RecordLocationErrorReason, message?: string) {
    super(message ?? reason);
    this.name = 'RecordLocationRequestError';
  }
}

interface NativeAppSettingsPlugin {
  openAppSettings: () => Promise<void>;
  openLocationSettings: () => Promise<void>;
}

const NativeAppSettings = registerPlugin<NativeAppSettingsPlugin>('NativeAppSettings');

function isPermissionGranted(status: Awaited<ReturnType<typeof Geolocation.checkPermissions>>) {
  return status.location === 'granted' || status.coarseLocation === 'granted';
}

function mapLocationError(error: unknown): RecordLocationRequestError {
  if (error instanceof RecordLocationRequestError)
    return error;
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? error.code
    : undefined;
  const name = typeof error === 'object' && error !== null && 'name' in error
    ? error.name
    : undefined;
  if (code === 1
    || name === 'NotAllowedError'
    || code === 'OS-PLUG-GLOC-0003'
    || code === 'OS-PLUG-GLOC-0008') {
    return new RecordLocationRequestError('permission-denied');
  }
  if (code === 3 || name === 'TimeoutError' || code === 'OS-PLUG-GLOC-0010')
    return new RecordLocationRequestError('timeout');
  if (code === 'OS-PLUG-GLOC-0007'
    || code === 'OS-PLUG-GLOC-0009'
    || code === 'OS-PLUG-GLOC-0016'
    || code === 'OS-PLUG-GLOC-0017') {
    return new RecordLocationRequestError('services-disabled');
  }
  if (code === 2
    || code === 'OS-PLUG-GLOC-0002'
    || code === 'OS-PLUG-GLOC-0014'
    || code === 'OS-PLUG-GLOC-0015'
    || code === 'OS-PLUG-GLOC-0018'
    || (typeof navigator !== 'undefined' && !navigator.geolocation)) {
    return new RecordLocationRequestError('unavailable');
  }
  return new RecordLocationRequestError('unknown');
}

export async function requestCurrentRecordLocation(): Promise<RecordLocation> {
  try {
    if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && !window.isSecureContext)
      throw new RecordLocationRequestError('unavailable');
    if (Capacitor.isNativePlatform()) {
      const current = await Geolocation.checkPermissions();
      if (!isPermissionGranted(current)) {
        const requested = await Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation'],
        });
        if (!isPermissionGranted(requested))
          throw new RecordLocationRequestError('permission-denied');
      }
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      enableLocationFallback: true,
      maximumAge: 15_000,
      timeout: 15_000,
    });
    return {
      accuracy: Math.max(0, position.coords.accuracy),
      capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }
  catch (error) {
    throw mapLocationError(error);
  }
}

export function getRecordLocationErrorReason(error: unknown): RecordLocationErrorReason {
  return mapLocationError(error).reason;
}

export function canOpenNativeLocationSettings() {
  return Capacitor.getPlatform() === 'android';
}

export async function openNativeLocationSettings(kind: 'app' | 'services') {
  if (!canOpenNativeLocationSettings())
    return false;
  if (kind === 'services')
    await NativeAppSettings.openLocationSettings();
  else
    await NativeAppSettings.openAppSettings();
  return true;
}
