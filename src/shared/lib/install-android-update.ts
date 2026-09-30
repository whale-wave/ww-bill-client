import { registerPlugin } from '@capacitor/core';

interface NativeAppUpdatePlugin {
  downloadAndInstall: (options: { url: string; versionCode: number }) => Promise<void>;
}

const NativeAppUpdate = registerPlugin<NativeAppUpdatePlugin>('NativeAppUpdate');

export function installAndroidUpdate(url: string, versionCode: number) {
  return NativeAppUpdate.downloadAndInstall({ url, versionCode });
}

export function isInstallPermissionRequired(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    && error.code === 'INSTALL_PERMISSION_REQUIRED';
}
