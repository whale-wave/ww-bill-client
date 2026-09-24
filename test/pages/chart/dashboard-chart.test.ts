import { describe, expect, it } from 'vitest';
import { buildAssetTrendGeometry, buildTrendGeometry, formatChartPercent, getLatestAssetValue } from '@/pages/chart/chart-home/model/dashboard-chart';

describe('dashboard chart geometry', () => {
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
