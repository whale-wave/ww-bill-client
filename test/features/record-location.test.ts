import { describe, expect, it } from 'vitest';
import { formatRecordLocationCoordinates, formatRecordLocationLabel } from '@/entities/record';
import { getRecordLocationErrorReason, RecordLocationRequestError } from '@/features/record-editor';

describe('record location contracts', () => {
  it('uses the confirmed name and falls back to stable coordinates', () => {
    const location = {
      accuracy: 18.4,
      capturedAt: '2026-09-09T10:11:12.000Z',
      latitude: 22.817,
      longitude: 108.366,
    };

    expect(formatRecordLocationCoordinates(location)).toBe('22.81700, 108.36600');
    expect(formatRecordLocationLabel(location)).toBe('22.81700, 108.36600');
    expect(formatRecordLocationLabel({ ...location, name: '万象城' })).toBe('万象城');
  });

  it.each([
    [{ code: 'OS-PLUG-GLOC-0003' }, 'permission-denied'],
    [{ code: 'OS-PLUG-GLOC-0007' }, 'services-disabled'],
    [{ code: 'OS-PLUG-GLOC-0010' }, 'timeout'],
    [{ code: 'OS-PLUG-GLOC-0018' }, 'unavailable'],
    [{ code: 2 }, 'unavailable'],
    [{ name: 'NotAllowedError' }, 'permission-denied'],
    [{ name: 'TimeoutError' }, 'timeout'],
    [new RecordLocationRequestError('permission-denied'), 'permission-denied'],
  ] as const)('maps native and browser failures to a recoverable reason', (error, expected) => {
    expect(getRecordLocationErrorReason(error)).toBe(expected);
  });
});
