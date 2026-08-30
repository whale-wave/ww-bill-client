import { QueryObserver } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/shared/api/query-client';

describe('query client refresh policy', () => {
  const clients: ReturnType<typeof createQueryClient>[] = [];

  afterEach(() => {
    clients.splice(0).forEach(client => client.clear());
  });

  it('keeps cached data visible and refetches when a page query remounts', async () => {
    const client = createQueryClient();
    clients.push(client);
    let resolveRefresh: ((value: { total: number }) => void) | undefined;
    const queryFn = vi.fn()
      .mockResolvedValueOnce({ total: 1 })
      .mockImplementationOnce(() => new Promise<{ total: number }>((resolve) => {
        resolveRefresh = resolve;
      }));
    const options = {
      queryFn,
      queryKey: ['household', 'current-page'],
    };

    const firstObserver = new QueryObserver(client, options);
    const unsubscribeFirst = firstObserver.subscribe(() => undefined);
    await vi.waitFor(() => expect(firstObserver.getCurrentResult().data).toEqual({ total: 1 }));
    unsubscribeFirst();

    const remountedObserver = new QueryObserver(client, options);
    const unsubscribeRemounted = remountedObserver.subscribe(() => undefined);
    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));

    expect(remountedObserver.getCurrentResult()).toMatchObject({
      data: { total: 1 },
      isFetching: true,
      isLoading: false,
    });

    resolveRefresh?.({ total: 2 });
    await vi.waitFor(() => expect(remountedObserver.getCurrentResult().data).toEqual({ total: 2 }));
    unsubscribeRemounted();
  });
});
