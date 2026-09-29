import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

interface ClientDeviceHeaders {
  platform: 'android' | 'ios';
  model: string;
  osVersion: string;
}

let deviceInfoPromise: Promise<ClientDeviceHeaders | undefined> | undefined;

export function getClientDeviceHeaders() {
  if (!Capacitor.isNativePlatform())
    return Promise.resolve(undefined);

  deviceInfoPromise ??= Device.getInfo()
    .then((info) => {
      if (info.platform !== 'android' && info.platform !== 'ios')
        return undefined;
      return {
        model: info.model?.trim().slice(0, 160) ?? '',
        osVersion: info.osVersion?.trim().slice(0, 32) ?? '',
        platform: info.platform,
      };
    })
    .catch(() => undefined);
  return deviceInfoPromise;
}
