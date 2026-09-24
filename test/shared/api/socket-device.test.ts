import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  auth: undefined as undefined | ((callback: (value: Record<string, string>) => void) => void),
  device: vi.fn(),
}));

vi.mock('socket.io-client', () => ({
  io: (_host: string, options: { auth: typeof state.auth }) => {
    state.auth = options.auth;
    return { active: true, connected: true, disconnect: vi.fn() };
  },
}));
vi.mock('@/features/auth', () => ({ useAuthStore: { getState: () => ({ token: 'test-token' }) } }));
vi.mock('@/shared/api/client-device', () => ({ getClientDeviceHeaders: state.device }));

describe('socket device metadata', () => {
  beforeEach(() => {
    vi.resetModules();
    state.auth = undefined;
    state.device.mockReset();
  });

  it('includes native device information in the authenticated handshake', async () => {
    state.device.mockResolvedValue({ model: 'iPhone17,3', osVersion: '18.4', platform: 'ios' });
    const { getAppSocket } = await import('@/shared/api/socket');
    getAppSocket();

    const auth = await new Promise<Record<string, string>>(resolve => state.auth?.(resolve));
    expect(auth).toEqual({ clientPlatform: 'ios', deviceModel: 'iPhone17,3', osVersion: '18.4', token: 'Bearer test-token' });
  });
});
