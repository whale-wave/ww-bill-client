import { describe, expect, it } from 'vitest';
import { getTimeOfDay } from '@/shared/lib/date-time';

describe('date-time', () => {
  it('formats record time with zero-padded hours, minutes, and seconds', () => {
    const value = new Date(2026, 8, 9, 7, 8, 9);

    expect(getTimeOfDay(value)).toBe('07:08:09');
  });
});
