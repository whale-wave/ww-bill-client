import type { ChartDashboardParams, ChartDashboardPeriod } from '@/entities/chart';
import { addDays, addMonths, addYears, format, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resolveChartAccountFilter } from './query-params';

export type ChartDashboardScope = { kind: 'personal' } | { kind: 'ledger'; ledgerId: string } | { kind: 'household'; householdId: string };
export type ChartDashboardMetric = 'expense' | 'income' | 'net';

export function localDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

function parseDate(value: string | null, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return new Date(`${fallback}T12:00:00`);
  return new Date(`${value}T12:00:00`);
}

function legacyTabDate(value: string | null, period: ChartDashboardPeriod) {
  if (!value)
    return undefined;
  if (period === 'year' && /^\d{4}$/.test(value))
    return `${value}-01-01`;
  const match = value.match(/^(\d{4})-W?(\d{1,2})$/);
  if (!match)
    return undefined;
  const year = Number(match[1]);
  const part = Number(match[2]);
  if (period === 'month' && part >= 1 && part <= 12)
    return `${year}-${String(part).padStart(2, '0')}-01`;
  if (period === 'week' && part >= 1 && part <= 53)
    return localDate(startOfISOWeek(setISOWeek(setISOWeekYear(new Date(year, 0, 4), year), part)));
  return undefined;
}

function periodBounds(period: ChartDashboardPeriod, anchor: Date) {
  if (period === 'week') {
    const start = startOfISOWeek(anchor);
    return [localDate(start), localDate(addDays(start, 6))];
  }
  if (period === 'year')
    return [`${format(anchor, 'yyyy')}-01-01`, `${format(anchor, 'yyyy')}-12-31`];
  return [`${format(anchor, 'yyyy-MM')}-01`, localDate(addDays(addMonths(new Date(anchor.getFullYear(), anchor.getMonth(), 1), 1), -1))];
}

export function useChartDashboardUrlState(scope: ChartDashboardScope, defaultPeriod?: ChartDashboardPeriod) {
  const [params, setParams] = useSearchParams();
  const today = localDate();
  const earliestCustomDate = localDate(addYears(parseDate(today, today), -3));
  const rangeValue = params.get('range');
  const period = (['week', 'month', 'year', 'all', 'custom'].includes(rangeValue ?? '')
    ? rangeValue as ChartDashboardPeriod
    : defaultPeriod ?? (scope.kind === 'personal' ? 'week' : 'month'));
  const legacyDate = legacyTabDate(params.get('tab'), period);
  const anchor = parseDate(params.get('date') ?? legacyDate ?? null, today);
  const [periodStart, periodEnd] = period === 'custom'
    ? [(params.get('startDate') ?? today).slice(0, 10), (params.get('endDate') ?? today).slice(0, 10)]
    : periodBounds(period === 'all' ? 'year' : period, anchor);
  const metricParam = params.get('metric');
  const legacyDisplay = params.get('display');
  const legacyAmount = params.get('amount');
  const normalizedMetric = metricParam?.toLowerCase();
  const metric: ChartDashboardMetric = normalizedMetric === 'net'
    ? 'net'
    : ['income', 'add'].includes(normalizedMetric ?? '') || legacyAmount === 'add'
        ? 'income'
        : 'expense';
  const account = resolveChartAccountFilter(scope.kind, params.get('account'));
  const tagIds = (params.get('tagIds') ?? '').split(',').filter(Boolean);
  const queryParams: ChartDashboardParams = {
    period,
    ...(period === 'custom' ? { startDate: `${periodStart}T00:00:00+08:00`, endDate: `${periodEnd}T23:59:59+08:00` } : period !== 'all' ? { anchorDate: localDate(anchor) } : {}),
    ...(tagIds.length ? { tagIds, tagMatch: params.get('tagMatch') === 'all' ? 'all' : 'any' } : {}),
    ...(account ? { account } : {}),
    ...(params.get('sourceMemberId') ? { sourceMemberId: Number(params.get('sourceMemberId')) } : {}),
  };
  const assetParams = {
    period,
    ...(period === 'custom' ? { startDate: `${periodStart}T00:00:00+08:00`, endDate: `${periodEnd}T23:59:59+08:00` } : period !== 'all' ? { anchorDate: localDate(anchor) } : {}),
  } satisfies ChartDashboardParams;

  const setValue = (key: string, value?: string) => setParams((previous) => {
    if (value)
      previous.set(key, value);
    else
      previous.delete(key);
    previous.delete('tab');
    return previous;
  }, { replace: true });

  useEffect(() => {
    if (scope.kind === 'ledger' && params.has('account')) {
      setParams((previous) => {
        previous.delete('account');
        return previous;
      }, { replace: true });
      return;
    }
    const shouldSetDate = period !== 'all' && period !== 'custom' && !params.get('date');
    const shouldSetRange = !params.get('range');
    const shouldSetCustomRange = period === 'custom' && (!params.get('startDate') || !params.get('endDate'));
    const shouldSetMetric = !params.get('metric');
    if (shouldSetDate || shouldSetRange || shouldSetCustomRange || shouldSetMetric) {
      setParams((previous) => {
        if (shouldSetDate)
          previous.set('date', legacyDate ?? today);
        if (shouldSetRange)
          previous.set('range', period);
        if (shouldSetCustomRange) {
          if (!previous.get('startDate'))
            previous.set('startDate', today);
          if (!previous.get('endDate'))
            previous.set('endDate', today);
        }
        if (shouldSetMetric)
          previous.set('metric', metric);
        previous.delete('tab');
        return previous;
      }, { replace: true });
    }
  }, [legacyDate, metric, params, period, scope.kind, setParams, today]);

  return {
    account,
    anchor,
    assetParams,
    earliestCustomDate,
    legacyDate,
    legacyDisplay,
    metric,
    params,
    period,
    periodEnd,
    periodStart,
    queryParams,
    setParams,
    setValue,
    tagIds,
    today,
  };
}
