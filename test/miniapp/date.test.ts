import { describe, expect, it } from 'vitest';
import { dateKey, displayRecordDate, shanghaiDateTimeToIso, shiftMonth, timeKey } from '../../miniapp/src/shared/lib/date';

describe('miniapp Asia/Shanghai dates', () => {
  it('uses the service month at a UTC month boundary', () => {
    const instant = new Date('2026-09-30T16:30:00.000Z');
    expect(dateKey(instant)).toBe('2026-10-01');
    expect(timeKey(instant)).toBe('00:30');
    expect(displayRecordDate(instant.toISOString())).toBe('10月1日');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('serializes a picked Shanghai time independently of device timezone', () => {
    expect(shanghaiDateTimeToIso('2026-10-01', '00:30')).toBe('2026-09-30T16:30:00.000Z');
    expect(shanghaiDateTimeToIso('2026-02-30', '10:00')).toBeNull();
    expect(shanghaiDateTimeToIso('2026-10-01', '25:00')).toBeNull();
  });
});
