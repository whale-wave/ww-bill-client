import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyUploadedAvatar } from '@/entities/user/api';

const mocks = vi.hoisted(() => ({
  requestGet: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  request: { get: mocks.requestGet },
}));

describe('user avatar API', () => {
  beforeEach(() => {
    mocks.requestGet.mockReset();
  });

  it('verifies the persisted avatar variant rather than the upload preview variant', async () => {
    mocks.requestGet.mockResolvedValue(new Blob(['avatar'], { type: 'image/webp' }));

    await expect(verifyUploadedAvatar('/api/media/public/550e8400-e29b-41d4-a716-446655440000/main-v1'))
      .resolves
      .toBeUndefined();

    expect(mocks.requestGet).toHaveBeenCalledWith(
      'http://localhost/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1',
      { responseType: 'blob', silent: true },
    );
  });

  it('rejects an empty or non-image avatar response', async () => {
    mocks.requestGet.mockResolvedValue(new Blob([], { type: 'text/plain' }));

    await expect(verifyUploadedAvatar('/api/media/public/550e8400-e29b-41d4-a716-446655440000/main-v1'))
      .rejects
      .toThrow('Uploaded avatar is not readable');
  });
});
