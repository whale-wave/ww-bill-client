import { money } from './amount';

const donutCategoryLimit = 5;

/** Normalized geometry shared by browser SVG and miniapp image adapters. */
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

export function formatDashboardAmount(value: string | number, hidden = false) {
  return hidden ? '••••' : `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getChartAverage(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function getCategoryOtherAmount(categories: { amount: string | number }[]) {
  return categories.slice(donutCategoryLimit).reduce((sum, category) => money.add(sum, category.amount), '0');
}

export function getCategoryDonutSlices(categories: { amount: string | number }[]) {
  const total = categories.reduce((sum, item) => sum + Number(item.amount), 0);
  let accumulated = 0;
  const slices = categories.slice(0, donutCategoryLimit).map((item, index) => {
    const start = accumulated / Math.max(total, 0.01);
    accumulated += Number(item.amount);
    return { colorIndex: index, start, end: accumulated / Math.max(total, 0.01) };
  });
  return [...slices, { colorIndex: 5, start: accumulated / Math.max(total, 0.01), end: 1 }];
}
