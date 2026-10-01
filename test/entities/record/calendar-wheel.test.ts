import { calendarWheel } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';
import { shanghaiDateTimeToIso } from '../../../miniapp/src/shared/lib/date';

describe('calendar wheel', () => {
  const min: [number, number, number, number, number, number] = [2016, 10, 1, 14, 0, 0];
  const max: [number, number, number, number, number, number] = [2036, 10, 1, 14, 0, 0];
  it('clamps a short month while preserving hours, minutes and seconds', () => {
    expect(calendarWheel([2024, 2, 31, 20, 30, 59], min, max).selected).toEqual([2024, 2, 29, 20, 30, 59]);
    expect(calendarWheel([2025, 2, 31, 20, 30, 59], min, max).selected[2]).toBe(28);
  });
  it('restricts columns at the exact boundary date and time', () => {
    expect(calendarWheel([2016, 1, 1, 0, 0, 0], min, max).selected).toEqual(min);
    expect(calendarWheel([2036, 12, 31, 23, 59, 59], min, max).selected).toEqual(max);
  });
  it('converts Shanghai time with seconds while retaining minute-only support', () => {
    expect(shanghaiDateTimeToIso('2026-10-01', '00:01:59')).toBe('2026-09-30T16:01:59.000Z');
    expect(shanghaiDateTimeToIso('2026-10-01', '00:01')).toBe('2026-09-30T16:01:00.000Z');
    expect(shanghaiDateTimeToIso('2026-02-29', '00:01:59')).toBeNull();
    expect(shanghaiDateTimeToIso('2026-10-01', '00:01:60')).toBeNull();
  });
});
