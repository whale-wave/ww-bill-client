import type { GetChartApiResponse } from '@/entities/chart';
import type { Ledger } from '@/entities/ledger';
import { Button, SpinLoading } from 'antd-mobile';
import { useMemo, useState } from 'react';
import { useLedgerChartQuery } from '@/entities/chart';
import { LedgerCapability, LedgerChartDisplay, LedgerChartMetric, LedgerChartPeriod, useLedgerPreferencesQuery } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';
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

function LedgerChartsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const { t } = useTranslation('ledger');
  return (
    <>
      <header className="flex min-h-[45px] flex-shrink-0 items-center justify-center bg-primary px-4 text-lg text-font-black">
        {t('charts.title')}
      </header>
      <main className="min-h-0 flex-grow overflow-auto">
        <ChartContent ledgerId={ledgerId} />
      </main>
      <LedgerWorkspaceTabBar
        activeKey="charts"
        capabilities={ledger.capabilities}
        ledgerId={ledgerId}
      />
    </>
  );
}

export default function LedgerChartsPage() {
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
        {scope => <LedgerChartsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
