import type { PersonalAssetDashboardResult } from '@/entities/chart';

export function buildTrendGeometry(values: number[]) {
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const span = Math.max(1, maximum - minimum);
  const zeroY = 92 - (0 - minimum) / span * 84;
  const points = values.map((value, index) => ({
    x: values.length <= 1 ? 50 : index / (values.length - 1) * 100,
    y: 92 - (value - minimum) / span * 84,
  }));
  const path = points.length ? `M ${points.map(point => `${point.x} ${point.y}`).join(' L ')}` : '';
  return { points, path, zeroY };
}

export function formatChartPercent(fraction: number) {
  if (fraction > 0 && fraction * 100 < 0.05)
    return '<0.1%';
  return `${Math.round(fraction * 1000) / 10}%`;
}

export function getLatestAssetValue(
  timeline: PersonalAssetDashboardResult['timeline'],
  metric: 'netAsset' | 'asset' | 'liability',
) {
  return timeline.reduce<string | null>((latest, point) => point[metric] ?? latest, null);
}

export function buildAssetTrendGeometry(
  timeline: PersonalAssetDashboardResult['timeline'],
  metric: 'netAsset' | 'asset' | 'liability',
) {
  const values = timeline.flatMap(point => point[metric] === null ? [] : [Number(point[metric])]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const span = Math.max(1, maximum - minimum);
  const zeroY = 92 - (0 - minimum) / span * 84;
  const points = timeline.map((item, index) => {
    const value = item[metric];
    if (value === null)
      return null;
    return {
      date: item.date,
      value,
      x: timeline.length <= 1 ? 50 : index / (timeline.length - 1) * 100,
      y: 92 - (Number(value) - minimum) / span * 84,
    };
  });
  const paths: string[] = [];
  let segment: string[] = [];
  for (const point of points) {
    if (!point) {
      if (segment.length)
        paths.push(segment.join(' '));
      segment = [];
      continue;
    }
    segment.push(`${segment.length ? 'L' : 'M'} ${point.x} ${point.y}`);
  }
  if (segment.length)
    paths.push(segment.join(' '));
  return { paths, points, zeroY };
}
