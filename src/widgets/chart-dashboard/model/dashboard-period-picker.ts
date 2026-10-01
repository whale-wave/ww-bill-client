import type { ChartDashboardPeriod } from '@/entities/chart';
import { formatMonthPeriod, getMonthPeriodChoices } from '@ww-bill/bill-core';
import { addDays, addMonths, format, getISOWeek, getISOWeekYear, startOfISOWeek, subDays } from 'date-fns';

export type SelectableDashboardPeriod = Extract<ChartDashboardPeriod, 'week' | 'month' | 'year'>;

export interface DashboardPeriodChoice {
  anchorDate: string;
  endDate: string;
  startDate: string;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;
const localDate = (date: Date) => format(date, 'yyyy-MM-dd');

function fromDateKey(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function getDashboardPeriodBounds(period: SelectableDashboardPeriod, anchor: Date): [string, string] {
  if (period === 'week') {
    const start = startOfISOWeek(anchor);
    return [localDate(start), localDate(addDays(start, 6))];
  }
  if (period === 'year')
    return [`${anchor.getFullYear()}-01-01`, `${anchor.getFullYear()}-12-31`];
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
  return [localDate(first), localDate(subDays(addMonths(first, 1), 1))];
}

export function getDashboardPeriodYear(period: SelectableDashboardPeriod, anchorDate: string) {
  const anchor = fromDateKey(anchorDate);
  return period === 'week' ? getISOWeekYear(anchor) : anchor.getFullYear();
}

export function getDashboardPeriodTitle(period: SelectableDashboardPeriod, anchorDate: string, today: string, t: Translate) {
  const anchor = fromDateKey(anchorDate);
  const current = fromDateKey(today);
  if (period === 'week') {
    const selectedStart = localDate(startOfISOWeek(anchor));
    if (selectedStart === localDate(startOfISOWeek(current)))
      return t('tab.thisWeek');
    if (selectedStart === localDate(startOfISOWeek(subDays(current, 7))))
      return t('tab.lastWeek');
    const year = getISOWeekYear(anchor);
    const week = getISOWeek(anchor);
    return year === getISOWeekYear(current)
      ? t('tab.weekNumber', { week })
      : t('tab.yearWeekNumber', { year, week });
  }
  if (period === 'month') {
    return formatMonthPeriod(anchorDate.slice(0, 7), today.slice(0, 7), {
      thisMonth: t('tab.thisMonth'),
      lastMonth: t('tab.lastMonth'),
      monthNumber: month => t('tab.monthNumber', { month }),
      yearMonthNumber: (year, month) => t('tab.yearMonthNumber', { year, month }),
    });
  }
  const year = anchor.getFullYear();
  if (year === current.getFullYear())
    return t('tab.thisYear');
  if (year === current.getFullYear() - 1)
    return t('tab.lastYear');
  return t('tab.yearNumber', { year });
}

export function getDashboardPeriodChoices(period: SelectableDashboardPeriod, viewYear: number, today: string): DashboardPeriodChoice[] {
  const choices: DashboardPeriodChoice[] = [];
  if (period === 'week') {
    let start = startOfISOWeek(new Date(viewYear, 0, 4, 12));
    while (getISOWeekYear(start) === viewYear) {
      const [startDate, endDate] = getDashboardPeriodBounds('week', start);
      if (startDate <= today)
        choices.push({ anchorDate: startDate, endDate, startDate });
      start = addDays(start, 7);
    }
  }
  else if (period === 'month') {
    choices.push(...getMonthPeriodChoices(viewYear, today));
  }
  else {
    for (let year = viewYear; year > viewYear - 10 && year >= 1900; year--) {
      const [startDate, endDate] = getDashboardPeriodBounds('year', new Date(year, 0, 1, 12));
      if (startDate <= today)
        choices.push({ anchorDate: startDate, endDate, startDate });
    }
  }
  return period === 'year' ? choices : choices.reverse();
}
