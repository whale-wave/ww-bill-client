import type { GetChartApiResponse } from '@/entities/chart';
import { Button, NavBar, SpinLoading } from 'antd-mobile';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLedgerChartQuery } from '@/entities/chart';
import { LedgerCapability, LedgerChartDisplay, LedgerChartMetric, LedgerChartPeriod, useLedgerPreferencesQuery } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { getLedgerChartTotal } from './model';

function sumChart(data: GetChartApiResponse) {
  return data.reduce((total, item) => total + Number(item.amount), 0);
}

function ChartContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const [metricOverride, setMetricOverride] = useState<LedgerChartMetric>();
  const [periodOverride, setPeriodOverride] = useState<LedgerChartPeriod>();
  const [displayOverride, setDisplayOverride] = useState<LedgerChartDisplay>();
  const metric = metricOverride ?? preferenceQuery.data?.defaultChartMetric ?? LedgerChartMetric.EXPENSE;
  const period = periodOverride ?? preferenceQuery.data?.defaultChartPeriod ?? LedgerChartPeriod.MONTH;
  const display = displayOverride ?? preferenceQuery.data?.defaultChartDisplay ?? LedgerChartDisplay.PIE;
  const income = useLedgerChartQuery({ params: { ledgerId, filters: { category: period, type: 'add' } }, queryOptions: { enabled: metric !== LedgerChartMetric.EXPENSE } });
  const expense = useLedgerChartQuery({ params: { ledgerId, filters: { category: period, type: 'sub' } }, queryOptions: { enabled: metric !== LedgerChartMetric.INCOME } });
  const total = useMemo(() => getLedgerChartTotal(metric, sumChart(income.data), sumChart(expense.data)), [expense.data, income.data, metric]);
  const displayData = metric === LedgerChartMetric.INCOME ? income.data : expense.data;
  return (
    <>
      {(income.isLoading || expense.isLoading) && <SpinLoading />}
      <div className="flex flex-wrap gap-2 bg-white px-4 py-3">
        {Object.values(LedgerChartMetric).map(value => <Button color={metric === value ? 'primary' : 'default'} key={value} onClick={() => setMetricOverride(value)} size="small">{t(`charts.metric.${value}`)}</Button>)}
        {Object.values(LedgerChartPeriod).map(value => <Button key={value} onClick={() => setPeriodOverride(value)} size="small">{t(`charts.period.${value}`)}</Button>)}
        {Object.values(LedgerChartDisplay).map(value => <Button color={display === value ? 'primary' : 'default'} key={value} onClick={() => setDisplayOverride(value)} size="small">{t(`charts.display.${value}`)}</Button>)}
      </div>
      <section className="bg-primary px-4 py-5">
        <p>{t('charts.total')}</p>
        <strong className="text-3xl" data-testid="ledger-chart-total">{preferenceQuery.data?.hideTotalAmount ? '••••' : total}</strong>
      </section>
      <section className="mt-3 bg-white px-4 py-3" data-chart-display={display}>
        {metric === LedgerChartMetric.NET
          ? <p>{t('charts.netNoRanking')}</p>
          : displayData.map(item => (
              <div className="mb-2 flex justify-between" key={item.value}>
                <span>{String(item.value)}</span>
                <span>{item.amount}</span>
              </div>
            ))}
      </section>
    </>
  );
}

export default function LedgerChartsPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('charts.title')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>{({ ledgerId }) => <ChartContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
