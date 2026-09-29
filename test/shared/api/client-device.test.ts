import { beforeEach, describe, expect, it, vi } from 'vitest';

const nativePlatform = vi.hoisted(() => vi.fn());
const getInfo = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: nativePlatform } }));
vi.mock('@capacitor/device', () => ({ Device: { getInfo } }));

describe('client device headers', () => {
  beforeEach(() => {
    vi.resetModules();
    nativePlatform.mockReset();
    getInfo.mockReset();
  });

  it('does not request hardware identifiers in the browser', async () => {
    nativePlatform.mockReturnValue(false);
    const { getClientDeviceHeaders } = await import('@/shared/api/client-device');

    await expect(getClientDeviceHeaders()).resolves.toBeUndefined();
    expect(getInfo).not.toHaveBeenCalled();
  });

  it('reads native model and system version once for subsequent requests', async () => {
    nativePlatform.mockReturnValue(true);
    getInfo.mockResolvedValue({ model: 'iPhone17,3', osVersion: '18.4', platform: 'ios' });
    const { getClientDeviceHeaders } = await import('@/shared/api/client-device');

    await expect(getClientDeviceHeaders()).resolves.toEqual({ model: 'iPhone17,3', osVersion: '18.4', platform: 'ios' });
    await getClientDeviceHeaders();
    expect(getInfo).toHaveBeenCalledTimes(1);
  });

  it('allows requests to continue if the native plugin is unavailable', async () => {
    nativePlatform.mockReturnValue(true);
    getInfo.mockRejectedValue(new Error('unavailable'));
    const { getClientDeviceHeaders } = await import('@/shared/api/client-device');

    await expect(getClientDeviceHeaders()).resolves.toBeUndefined();
  });
});
