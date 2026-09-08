import type { ChartPeriodOption } from '@/entities/chart';
import { getISOWeek, getISOWeekYear, getMonth, getYear, subMonths, subYears } from 'date-fns';

type Translate = (key: string, options?: Record<string, unknown>) => string;

function getShanghaiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(`${values.year}-${values.month}-${values.day}T12:00:00`);
}

export function getChartPeriodName(option: ChartPeriodOption, t: Translate) {
  const now = getShanghaiToday();
  if (option.period === 'week') {
    const currentKey = `${getISOWeekYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
    const previous = new Date(now);
    previous.setDate(previous.getDate() - 7);
    const previousKey = `${getISOWeekYear(previous)}-W${String(getISOWeek(previous)).padStart(2, '0')}`;
    if (option.key === currentKey)
      return t('tab.thisWeek');
    if (option.key === previousKey)
      return t('tab.lastWeek');
    return option.isoWeekYear === getISOWeekYear(now)
      ? t('tab.weekNumber', { week: option.isoWeek })
      : t('tab.yearWeekNumber', { year: option.isoWeekYear, week: option.isoWeek });
  }

  if (option.period === 'month') {
    const currentMonth = getMonth(now) + 1;
    const currentYear = getYear(now);
    const previousMonthDate = subMonths(now, 1);
    const previousMonth = getMonth(previousMonthDate) + 1;
    const previousMonthYear = getYear(previousMonthDate);
    if (option.year === currentYear && option.month === currentMonth)
      return t('tab.thisMonth');
    if (option.year === previousMonthYear && option.month === previousMonth)
      return t('tab.lastMonth');
    if (option.year === currentYear)
      return t('tab.monthNumber', { month: option.month });
    return t('tab.yearMonthNumber', { year: option.year, month: option.month });
  }

  const currentYear = getYear(now);
  const previousYear = getYear(subYears(now, 1));
  if (option.year === currentYear)
    return t('tab.thisYear');
  if (option.year === previousYear)
    return t('tab.lastYear');
  return t('tab.yearNumber', { year: option.year });
}
