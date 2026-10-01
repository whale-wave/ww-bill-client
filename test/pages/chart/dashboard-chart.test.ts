import { formatDashboardAmount, getCategoryDonutSlices } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';
import { buildAssetTrendGeometry, buildTrendGeometry, formatChartPercent, getLatestAssetValue } from '@/widgets/chart-dashboard/model/dashboard-chart';
import { resolveChartAccountFilter } from '@/widgets/chart-dashboard/model/query-params';

describe('dashboard chart geometry', () => {
  it('keeps the other ring segment and grouped currency identical across hosts', () => {
    const slices = getCategoryDonutSlices(Array.from({ length: 6 }, () => ({ amount: '10' })));
    expect(slices).toHaveLength(6);
    expect(slices[5].start).toBeCloseTo(5 / 6);
    expect(slices[5].end).toBe(1);
    expect(getCategoryDonutSlices([])).toEqual([{ colorIndex: 5, start: 0, end: 1 }]);
    expect(formatDashboardAmount('-1234.5')).toBe('¥-1,234.50');
    expect(formatDashboardAmount('1234.5', true)).toBe('••••');
  });
  it('drops legacy account filters for custom ledgers while preserving supported scopes', () => {
    expect(resolveChartAccountFilter('ledger', 'asset-1')).toBeUndefined();
    expect(resolveChartAccountFilter('personal', 'asset-1')).toBe('asset-1');
    expect(resolveChartAccountFilter('household', 'unlinked')).toBe('unlinked');
  });

  it('uses the full plot height above zero for income and expense', () => {
    const chart = buildTrendGeometry([0, 100, 0]);
    expect(chart.zeroY).toBe(92);
    expect(chart.points.map(point => point.y)).toEqual([92, 8, 92]);
  });

  it('keeps the zero line between positive and negative net values', () => {
    const chart = buildTrendGeometry([-50, 0, 50]);
    expect(chart.zeroY).toBe(50);
    expect(chart.points.map(point => point.y)).toEqual([92, 50, 8]);
  });

  it('keeps an all-zero series on the bottom baseline', () => {
    const chart = buildTrendGeometry([0, 0]);
    expect(chart.zeroY).toBe(92);
    expect(chart.points.map(point => point.y)).toEqual([92, 92]);
    expect(chart.path).not.toContain('NaN');
  });

  it('shows a small nonzero category share instead of zero percent', () => {
    expect(formatChartPercent(19 / 23570.33)).toBe('0.1%');
    expect(formatChartPercent(0.27)).toBe('27%');
    expect(formatChartPercent(0)).toBe('0%');
  });

  it('shows the latest value for the selected asset metric only', () => {
    const timeline = [
      { date: '2026-01-01', asset: '100.00', liability: null, netAsset: null },
      { date: '2026-02-01', asset: null, liability: null, netAsset: null },
    ];
    expect(getLatestAssetValue(timeline, 'asset')).toBe('100.00');
    expect(getLatestAssetValue(timeline, 'netAsset')).toBeNull();
  });

  it('keeps asset markers aligned with line segments across missing snapshots', () => {
    const timeline = [
      { date: '2026-01-01', asset: '0.00', liability: null, netAsset: null },
      { date: '2026-02-01', asset: null, liability: null, netAsset: null },
      { date: '2026-03-01', asset: '100.00', liability: null, netAsset: null },
      { date: '2026-04-01', asset: '50.00', liability: null, netAsset: null },
    ];
    const geometry = buildAssetTrendGeometry(timeline, 'asset');
    expect(geometry.points[0]).toMatchObject({ x: 0, y: 92 });
    expect(geometry.points[1]).toBeNull();
    expect(geometry.points[2]?.x).toBeCloseTo(200 / 3);
    expect(geometry.points[2]?.y).toBe(8);
    expect(geometry.points[3]).toMatchObject({ x: 100, y: 50 });
    expect(geometry.paths).toHaveLength(2);
    expect(geometry.paths[1]).toContain('L 100 50');
  });
});
