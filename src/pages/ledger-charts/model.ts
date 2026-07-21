import type { GetChartApiParams } from '@/entities/chart';
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
