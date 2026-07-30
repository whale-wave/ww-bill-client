import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import type { Ledger } from '@/entities/ledger';
import type {
  ChartOverviewContextValue,
  ChartOverviewDisplay,
  ChartOverviewMetric,
  ChartOverviewTab,
} from '@/features/chart-overview';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLedgerChartQuery } from '@/entities/chart';
import {
  LedgerCapability,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  useLedgerPreferencesQuery,
} from '@/entities/ledger';
import {
  ChartOverviewContext,
  ChartOverviewPresentation,
  deriveChartTabs,
} from '@/features/chart-overview';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';
import { combineLedgerNetTabs } from './model';

function isMetric(value: string | null): value is LedgerChartMetric {
  return Object.values(LedgerChartMetric).includes(value as LedgerChartMetric);
}

function isPeriod(value: string | null): value is LedgerChartPeriod {
  return Object.values(LedgerChartPeriod).includes(value as LedgerChartPeriod);
}

function isDisplay(value: string | null): value is LedgerChartDisplay {
  return Object.values(LedgerChartDisplay).includes(value as LedgerChartDisplay);
}

function toAmountType(metric: LedgerChartMetric): AmountType {
  return metric === LedgerChartMetric.INCOME ? 'add' : 'sub';
}

function toChartMetric(metric: LedgerChartMetric): ChartOverviewMetric {
  if (metric === LedgerChartMetric.NET)
    return 'net';
  return toAmountType(metric);
}

function toLedgerMetric(metric: ChartOverviewMetric): LedgerChartMetric {
  if (metric === 'net')
    return LedgerChartMetric.NET;
  return metric === 'add' ? LedgerChartMetric.INCOME : LedgerChartMetric.EXPENSE;
}

function ChartContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const [searchParams, setSearchParams] = useSearchParams();
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const metric = isMetric(searchParams.get('metric'))
    ? searchParams.get('metric') as LedgerChartMetric
    : preferenceQuery.data?.defaultChartMetric ?? LedgerChartMetric.EXPENSE;
  const period = isPeriod(searchParams.get('range'))
    ? searchParams.get('range') as LedgerChartPeriod
    : preferenceQuery.data?.defaultChartPeriod ?? LedgerChartPeriod.MONTH;
  const requestedDisplay = isDisplay(searchParams.get('display'))
    ? searchParams.get('display') as LedgerChartDisplay
    : preferenceQuery.data?.defaultChartDisplay ?? LedgerChartDisplay.LINE;
  const display: ChartOverviewDisplay = metric === LedgerChartMetric.NET
    ? 'line'
    : requestedDisplay;
  const income = useLedgerChartQuery({
    params: { filters: { category: period, type: 'add' }, ledgerId },
    queryOptions: {
      enabled: metric === LedgerChartMetric.INCOME || metric === LedgerChartMetric.NET,
    },
  });
  const expense = useLedgerChartQuery({
    params: { filters: { category: period, type: 'sub' }, ledgerId },
    queryOptions: {
      enabled: metric === LedgerChartMetric.EXPENSE || metric === LedgerChartMetric.NET,
    },
  });
  const incomeTabs = useMemo(() => deriveChartTabs(income.data), [income.data]);
  const expenseTabs = useMemo(() => deriveChartTabs(expense.data), [expense.data]);
  const tabs = useMemo<ChartOverviewTab[]>(() => {
    if (metric === LedgerChartMetric.NET)
      return combineLedgerNetTabs(incomeTabs, expenseTabs);
    return metric === LedgerChartMetric.INCOME ? incomeTabs : expenseTabs;
  }, [expenseTabs, incomeTabs, metric]);
  const urlTab = searchParams.get('tab') ?? '';
  const curTab = tabs.find(tab => tab.key === urlTab) ?? tabs.at(-1);
  const isLoading = metric === LedgerChartMetric.INCOME
    ? income.isLoading
    : metric === LedgerChartMetric.EXPENSE
      ? expense.isLoading
      : income.isLoading || expense.isLoading;
  const isError = metric === LedgerChartMetric.INCOME
    ? income.isError
    : metric === LedgerChartMetric.EXPENSE
      ? expense.isError
      : income.isError || expense.isError;

  const setSearchValue = useCallback((key: string, value: string, resetTab = false) => {
    setSearchParams((previous) => {
      previous.set(key, value);
      if (resetTab)
        previous.delete('tab');
      return previous;
    }, { replace: true });
  }, [setSearchParams]);

  const contextValue = useMemo<ChartOverviewContextValue>(() => ({
    currentAmountType: toAmountType(metric),
    currentMetric: toChartMetric(metric),
    currentTimeRangeCategory: period as TimeRangeCategory,
    curTab,
    displayMode: display,
    isAmountHidden: preferenceQuery.data?.hideTotalAmount === true,
    metricOptions: [
      {
        icon: 'huankuanzhichu-copy',
        label: t(`charts.metric.${LedgerChartMetric.EXPENSE}`),
        value: 'sub',
      },
      {
        icon: 'jiekuanshouru-copy',
        label: t(`charts.metric.${LedgerChartMetric.INCOME}`),
        value: 'add',
      },
      {
        icon: 'chart',
        label: t(`charts.metric.${LedgerChartMetric.NET}`),
        value: 'net',
      },
    ],
    onMetricChange: value => setSearchValue('metric', toLedgerMetric(value), true),
    rankingEmptyContent: metric === LedgerChartMetric.NET
      ? t('charts.netNoRanking')
      : undefined,
    rankingInteraction: 'none',
    setCurrentAmountType: value =>
      setSearchValue('metric', toLedgerMetric(value), true),
    setCurrentTimeRangeCategory: value => setSearchValue('range', value, true),
    setTabActive: value => setSearchValue('tab', value),
    tabActive: curTab?.key ?? '',
    tabs,
    totalLabel: metric === LedgerChartMetric.NET
      ? t('charts.total')
      : undefined,
    totalTestId: 'ledger-chart-total',
  }), [
    curTab,
    display,
    metric,
    period,
    preferenceQuery.data?.hideTotalAmount,
    setSearchValue,
    t,
    tabs,
  ]);

  if (isLoading || preferenceQuery.isLoading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <SpinLoading />
      </div>
    );
  }
  if (isError || preferenceQuery.isError) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <ErrorBlock
          description={t('common.loadErrorDescription')}
          title={t('common.loadError')}
        />
      </div>
    );
  }

  return (
    <ChartOverviewContext.Provider value={contextValue}>
      <ChartOverviewPresentation />
    </ChartOverviewContext.Provider>
  );
}

function LedgerChartsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  return (
    <>
      <ChartContent ledgerId={ledgerId} />
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
    <div className="page-new overflow-hidden bg-white">
      <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
        {scope => <LedgerChartsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
