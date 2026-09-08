import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportPresence } from '@/entities/auth';

const request = vi.hoisted(() => ({
  post: vi.fn(),
}));
const captureRequestAuth = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api', () => ({ captureRequestAuth, request }));

describe('auth presence api', () => {
  beforeEach(() => {
    request.post.mockReset();
    captureRequestAuth.mockReset();
    captureRequestAuth.mockReturnValue({
      token: 'token-1',
      identity: { sessionEpoch: 1, credentialRevision: 1 },
    });
  });

  it('serializes presence transitions so offline cannot overtake online', async () => {
    let resolveOnline: ((value: unknown) => void) | undefined;
    request.post
      .mockImplementationOnce(() => new Promise(resolve => resolveOnline = resolve))
      .mockResolvedValueOnce({ statusCode: 200 });

    const onlineRequest = reportPresence('online');
    const offlineRequest = reportPresence('offline');

    await Promise.resolve();
    expect(request.post).toHaveBeenCalledTimes(1);
    expect(request.post).toHaveBeenNthCalledWith(1, '/auth/presence', { state: 'online' }, {
      authContext: {
        token: 'token-1',
        identity: { sessionEpoch: 1, credentialRevision: 1 },
      },
      silent: true,
    });

    resolveOnline?.({ statusCode: 200 });
    await onlineRequest;
    await offlineRequest;

    expect(request.post).toHaveBeenNthCalledWith(2, '/auth/presence', { state: 'offline' }, {
      authContext: {
        token: 'token-1',
        identity: { sessionEpoch: 1, credentialRevision: 1 },
      },
      silent: true,
    });
  });

  it('binds a queued event to the session that enqueued it', async () => {
    let resolveOnline: ((value: unknown) => void) | undefined;
    request.post
      .mockImplementationOnce(() => new Promise(resolve => resolveOnline = resolve))
      .mockResolvedValueOnce({ statusCode: 200 });
    captureRequestAuth
      .mockReturnValueOnce({ token: 'old-token', identity: { sessionEpoch: 1, credentialRevision: 1 } })
      .mockReturnValueOnce({ token: 'new-token', identity: { sessionEpoch: 2, credentialRevision: 1 } });

    const oldSessionOnline = reportPresence('online');
    const newSessionOffline = reportPresence('offline');
    await Promise.resolve();

    resolveOnline?.({ statusCode: 200 });
    await oldSessionOnline;
    await newSessionOffline;

    expect(request.post).toHaveBeenNthCalledWith(2, '/auth/presence', { state: 'offline' }, {
      authContext: {
        token: 'new-token',
        identity: { sessionEpoch: 2, credentialRevision: 1 },
      },
      silent: true,
    });
  });
});
