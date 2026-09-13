import { describe, expect, it } from 'vitest';
import { formatAssetAmount } from '../../src/shared/lib/amount';

describe('formatAssetAmount', () => {
  it('formats asset accounts (type === add) correctly', () => {
    expect(formatAssetAmount(500, 'add')).toBe('¥500.00');
    expect(formatAssetAmount(0, 'add')).toBe('¥0.00');
    expect(formatAssetAmount(-100, 'add')).toBe('-¥100.00');
  });

  it('formats liability accounts (type === sub) correctly', () => {
    expect(formatAssetAmount(500, 'sub')).toBe('-¥500.00');
    expect(formatAssetAmount(0, 'sub')).toBe('¥0.00');
    expect(formatAssetAmount(-200, 'sub')).toBe('+¥200.00');
  });
});
