import type { GetChartApiParams } from '@/entities/chart';
import type { ChartOverviewTab } from '@/features/chart-overview';
import { LedgerChartMetric } from '@/entities/ledger';

export function getLedgerChartQueryTypes(
  metric: LedgerChartMetric,
): GetChartApiParams['type'][] {
  if (metric === LedgerChartMetric.NET)
    return ['add', 'sub'];
  return [metric === LedgerChartMetric.INCOME ? 'add' : 'sub'];
}

export function getLedgerChartTotal(
  metric: LedgerChartMetric,
  income: number,
  expense: number,
) {
  if (metric === LedgerChartMetric.NET)
    return income - expense;
  return metric === LedgerChartMetric.INCOME ? income : expense;
}

export function combineLedgerNetTabs(
  incomeTabs: readonly ChartOverviewTab[],
  expenseTabs: readonly ChartOverviewTab[],
): ChartOverviewTab[] {
  const incomeByKey = new Map(incomeTabs.map(tab => [tab.key, tab]));
  const expenseByKey = new Map(expenseTabs.map(tab => [tab.key, tab]));
  const keys = [...new Set([
    ...expenseTabs.map(tab => tab.key),
    ...incomeTabs.map(tab => tab.key),
  ])];

  return keys.map((key) => {
    const income = incomeByKey.get(key);
    const expense = expenseByKey.get(key);
    const incomePoints = new Map(income?.data.map(point => [point.value, point]) ?? []);
    const expensePoints = new Map(expense?.data.map(point => [point.value, point]) ?? []);
    const pointKeys = [...new Set([
      ...(expense?.data.map(point => point.value) ?? []),
      ...(income?.data.map(point => point.value) ?? []),
    ])];
    const data = pointKeys.map((value) => {
      const incomePoint = incomePoints.get(value);
      const expensePoint = expensePoints.get(value);
      return {
        amount: Number(incomePoint?.amount ?? 0) - Number(expensePoint?.amount ?? 0),
        data: [],
        displayLabel: incomePoint?.displayLabel ?? expensePoint?.displayLabel,
        tooltipMode: 'aggregate' as const,
        value,
      };
    });
    const amount = Number(income?.amount ?? 0) - Number(expense?.amount ?? 0);

    return {
      amount,
      average: (amount / Math.max(1, data.length)).toFixed(2),
      data,
      key,
      name: income?.name ?? expense?.name ?? key,
      ranking: [],
    };
  });
}
