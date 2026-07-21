import type { FC } from 'react';
import type { Household, HouseholdChartResult } from '@/entities/household';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdChartsQuery } from '@/entities/household';
import {
  formatCalendarDate,
  HouseholdBottomNav,
  HouseholdPageState,
  HouseholdScopeBoundary,
  HouseholdSummaryCard,
  toMoney,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const COLORS = ['#30C6B0', '#6C7BFF', '#FFB547', '#F2697B', '#8B6FE8', '#5AB0F2'];

const PieChart: FC<{ data: HouseholdChartResult['categories'] }> = ({ data }) => {
  let cursor = 0;
  const segments = data.map((item, index) => {
    const start = cursor;
    cursor += Math.max(0, item.percent) * 360;
    return `${COLORS[index % COLORS.length]} ${start}deg ${cursor}deg`;
  });
  return (
    <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center rounded-full" style={{ background: data.length ? `conic-gradient(${segments.join(',')})` : '#EEF0F2' }}>
      <div className="h-[102px] w-[102px] rounded-full bg-white" />
    </div>
  );
};

const LineChart: FC<{ data: HouseholdChartResult['timeline']; metric: 'expense' | 'income' | 'net' }> = ({ data, metric }) => {
  const values = data.map(point => Number(point[metric]));
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min;
  const toY = (value: number) => range === 0 ? 55 : 10 + ((max - value) / range) * 90;
  const denominator = Math.max(1, values.length - 1);
  const points = values.map((value, index) => `${(index / denominator) * 300},${toY(value)}`).join(' ');
  const zeroY = toY(0);
  return (
    <svg aria-label="line-chart" className="h-[150px] w-full" role="img" viewBox="0 0 300 110">
      <line stroke="#E5E7EB" x1="0" x2="300" y1={zeroY} y2={zeroY} />
      <polyline fill="none" points={points} stroke="var(--adm-color-primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
};

const Ranking: FC<{ items: Array<{ amount: string; key: string; label: string; percent: number }>; title: string }> = ({ items, title }) => (
  <section className="card-rounded bg-white px-4 py-4">
    <h2 className="text-base font-medium text-font-black">{title}</h2>
    <div className="mt-3 space-y-4">
      {items.map((item, index) => (
        <div key={item.key}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.label}</span>
            <span>{toMoney(item.amount)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-gray"><div className="h-full rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length], width: `${Math.max(2, item.percent * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  </section>
);

const ChartsContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [metric, setMetric] = useState<'expense' | 'income' | 'net'>('expense');
  const [display, setDisplay] = useState<'pie' | 'line'>('pie');
  const [anchorDate, setAnchorDate] = useState(() => formatCalendarDate(new Date()));
  const query = useHouseholdChartsQuery({
    params: { filters: { anchorDate, display, metric, period }, householdId: household.id },
    queryOptions: { enabled: true },
  });

  return (
    <>
      <main className="min-h-0 flex-grow overflow-auto px-3 pb-[84px] pt-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl bg-white p-1">
          {(['week', 'month', 'year'] as const).map(item => (
            <button className={`h-10 rounded-lg border-0 text-sm ${period === item ? 'bg-primary text-font-black' : 'bg-white text-font-gray'}`} data-period={item} key={item} onClick={() => setPeriod(item)} type="button">{t(`charts.${item}`)}</button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <input className="h-11 rounded-xl border-0 bg-white px-2 text-sm" onChange={event => setAnchorDate(event.target.value)} type="date" value={anchorDate} />
          <select className="h-11 rounded-xl border-0 bg-white px-2 text-sm" onChange={event => setMetric(event.target.value as typeof metric)} value={metric}>
            <option value="expense">{t('common.expense')}</option>
            <option value="income">{t('common.income')}</option>
            <option value="net">{t('common.net')}</option>
          </select>
          <select className="h-11 rounded-xl border-0 bg-white px-2 text-sm" onChange={event => setDisplay(event.target.value as typeof display)} value={display}>
            <option value="pie">{t('charts.pie')}</option>
            <option value="line">{t('charts.line')}</option>
          </select>
        </div>
        <div className="mt-3">
          <HouseholdPageState
            errorDescription={t('common.loadErrorDescription')}
            errorTitle={t('common.loadError')}
            isError={query.isError}
            isLoading={query.isLoading}
            loadingLabel={t('common.loading')}
            onRetry={() => void query.refetch()}
            retryLabel={t('common.retry')}
          >
            {query.data
              ? (
                  <div className="space-y-3">
                    <HouseholdSummaryCard expenseLabel={t('common.expense')} incomeLabel={t('common.income')} netLabel={t('common.net')} summary={query.data.summary} />
                    <section className="card-rounded bg-white px-3 py-4">
                      {display === 'pie' ? <PieChart data={query.data.categories} /> : <LineChart data={query.data.timeline} metric={metric} />}
                    </section>
                    {query.data.categories.length > 0 && (
                      <Ranking items={query.data.categories.map(item => ({ amount: item.amount, key: item.key, label: item.name, percent: item.percent }))} title={t('charts.categoryRanking')} />
                    )}
                    {query.data.members.length > 0 && (
                      <Ranking items={query.data.members.map(item => ({ amount: item.amount, key: String(item.user.id), label: item.user.name || item.user.username || '—', percent: item.percent }))} title={t('charts.memberRanking')} />
                    )}
                    {!query.data.categories.length && !query.data.members.length && <div className="card-rounded bg-white px-4 py-12 text-center text-sm text-font-gray">{t('charts.empty')}</div>}
                  </div>
                )
              : null}
          </HouseholdPageState>
        </div>
      </main>
      <HouseholdBottomNav active="charts" chartsLabel={t('home.chartsTab')} detailsLabel={t('home.detailsTab')} onCharts={() => undefined} onDetails={() => navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(household.id))} />
    </>
  );
};

const HouseholdChartsPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('charts.title')}</NavBar>
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <ChartsContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdChartsPage;
