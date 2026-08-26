import type { InstalledAndroidVersion } from './types';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export async function getInstalledAndroidVersion(): Promise<InstalledAndroidVersion | null> {
  if (Capacitor.getPlatform() !== 'android')
    return null;

  try {
    const info = await App.getInfo();
    const versionCode = Number.parseInt(info.build, 10);
    if (!Number.isSafeInteger(versionCode) || versionCode <= 0)
      return null;
    return { versionCode, versionName: info.version };
  }
  catch {
    return null;
  }
}
