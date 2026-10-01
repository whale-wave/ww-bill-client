import { afterEach, expect, it, vi } from 'vitest';
import { resolvePublicMediaUrl } from '../../miniapp/src/shared/lib/public-media-url';

afterEach(() => vi.unstubAllGlobals());

it('resolves public media paths against the API origin without appending a second api prefix', () => {
  vi.stubGlobal('BILL_API_BASE_URL', 'http://127.0.0.1:4301/');
  expect(resolvePublicMediaUrl('/api/media/public/550e8400-e29b-41d4-a716-446655440000/main-v1'))
    .toBe('http://127.0.0.1:4301/api/media/public/550e8400-e29b-41d4-a716-446655440000/main-v1');
  expect(resolvePublicMediaUrl('media:550e8400-e29b-41d4-a716-446655440000', 'avatar-v1'))
    .toBe('http://127.0.0.1:4301/api/media/public/550e8400-e29b-41d4-a716-446655440000/avatar-v1');
});

it('preserves absolute images and does not mistake other api paths for public images', () => {
  vi.stubGlobal('BILL_API_BASE_URL', 'https://api.example.test');
  expect(resolvePublicMediaUrl('https://cdn.example.test/icon.png')).toBe('https://cdn.example.test/icon.png');
  expect(resolvePublicMediaUrl('/api/user/userInfo')).toBe('/api/user/userInfo');
  expect(resolvePublicMediaUrl(null)).toBeNull();
});
