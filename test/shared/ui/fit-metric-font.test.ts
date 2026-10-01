import { fitMetricFontSize } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

describe('metric font fitting', () => {
  it('keeps the reference size for values that fit and hidden containers', () => {
    expect(fitMetricFontSize([{ availableWidth: 100, naturalWidth: 80 }, { availableWidth: 0, naturalWidth: 300 }])).toBe(28);
  });

  it('fits every visible metric to the widest proportion without rounding upward', () => {
    const measurements = [{ availableWidth: 100, naturalWidth: 200 }, { availableWidth: 90, naturalWidth: 190 }];
    const size = fitMetricFontSize(measurements);
    expect(size).toBe(13.26);
    for (const measurement of measurements)
      expect(measurement.naturalWidth * size / 28).toBeLessThanOrEqual(measurement.availableWidth);
  });
});
