import { afterEach, describe, expect, it, vi } from 'vitest';
import { showDate } from '@/shared/lib/time';

afterEach(() => {
  vi.useRealTimers();
});

describe('showDate', () => {
  it('formats recent timestamps as past time rather than future time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-05T08:04:00.000Z'));

    expect(showDate('2026-08-05T08:00:00.000Z')).toBe('4分钟前');
  });
});
