import type { ChartOverviewCustomRange } from './chart-overview-context';

export const MAX_CUSTOM_RANGE_YEARS = 3;

function formatDateKey(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) => index === 0 ? String(value) : String(value).padStart(2, '0'))
    .join('-');
}

function addCalendarYears(dateKey: string, years: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime()))
    return undefined;
  date.setFullYear(date.getFullYear() + years);
  return formatDateKey(date);
}

export function isCustomRangeWithinLimit(range: ChartOverviewCustomRange) {
  const startDate = range.startDate.slice(0, 10);
  const endDate = range.endDate.slice(0, 10);
  const latestEndDate = addCalendarYears(startDate, MAX_CUSTOM_RANGE_YEARS);
  return Boolean(latestEndDate && endDate <= latestEndDate);
}

export function isWholeDayCustomRange(range: ChartOverviewCustomRange) {
  return range.startDate.endsWith('T00:00:00') && range.endDate.endsWith('T23:59:59');
}

export function formatChartOverviewCustomRangeSummary(range: ChartOverviewCustomRange) {
  if (isWholeDayCustomRange(range))
    return `${range.startDate.slice(0, 10)} — ${range.endDate.slice(0, 10)}`;
  return `${range.startDate.replace('T', ' ')} — ${range.endDate.replace('T', ' ')}`;
}
