import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createHouseholdExportMutationFn,
  downloadHouseholdExportApi,
  getHouseholdExportTaskApi,
  getHouseholdExportTaskQueryFn,
  householdKeys,
  postHouseholdExportApi,
} from '@/entities/household';

const request = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/shared/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  request,
}));

describe('household export contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes create, status and download routes to the URL household id', () => {
    postHouseholdExportApi('household/a b', {
      filters: { counted: false, type: 'sub' },
      format: 'xlsx',
      idempotencyKey: 'export-1',
    });
    getHouseholdExportTaskApi('household/a b', 'task/a');
    downloadHouseholdExportApi('household/a b', 'task/a');

    expect(request.post).toHaveBeenCalledWith('/households/household%2Fa%20b/exports', {
      filters: { counted: false, type: 'sub' },
      format: 'xlsx',
      idempotencyKey: 'export-1',
    });
    expect(request.get).toHaveBeenCalledWith('/households/household%2Fa%20b/exports/task%2Fa');
    expect(request.get).toHaveBeenCalledWith(
      '/households/household%2Fa%20b/exports/task%2Fa/download',
      { responseType: 'blob' },
    );
  });

  it('uses household-scoped export query keys', () => {
    expect(householdKeys.exportTask('household/a', 'task/a')).toEqual([
      'household',
      'export',
      'household/a',
      'task/a',
    ]);
  });

  it('validates create and status business envelopes', async () => {
    request.post.mockResolvedValue({ data: null, message: 'conflict', statusCode: 409 });
    request.get.mockResolvedValue({ data: null, message: 'forbidden', statusCode: 403 });

    await expect(createHouseholdExportMutationFn({
      data: { filters: {}, format: 'csv', idempotencyKey: 'key' },
      householdId: 'household/a',
    })).rejects.toMatchObject({ message: 'conflict', statusCode: 409 });
    await expect(getHouseholdExportTaskQueryFn('household/a', 'task/a'))
      .rejects
      .toMatchObject({ message: 'forbidden', statusCode: 403 });
  });
});
