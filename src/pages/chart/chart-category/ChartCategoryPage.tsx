import type { FC } from 'react';
import type { ChartCategoryLocationState } from './model/chartCategoryUtils';
import { SpinLoading } from 'antd-mobile';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ReceiptText,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useGetChartQuery } from '@/entities/chart';
import { useTranslation } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib';
import { GradientPanel, IllustratedEmptyState } from '@/shared/ui';
import {
  getMatchedRouteState,
  getPeriodFromState,
  getPeriodsFromData,
  getRecordsAmount,
  isAmountType,
  isTimeRangeCategory,
} from './model/chartCategoryUtils';

function displayAmount(value: number | string | undefined) {
  if (value === undefined || Number.isNaN(Number(value)))
    return '--';
  return formatAmount(Number(value));
}

function displayRecordDate(value: string) {
  const datePart = value.slice(0, 10);
  const [, month, day] = datePart.split('-');
  return month && day ? `${month}.${day}` : value;
}

const ChartCategory: FC = () => {
  const { t } = useTranslation('chart');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state as ChartCategoryLocationState | null;

  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const tabKey = searchParams.get('tabKey');
  const hasRequiredParams = !!categoryId && isAmountType(type) && isTimeRangeCategory(category);

  const matchedRouteState = useMemo(() => {
    if (!categoryId || !isAmountType(type) || !isTimeRangeCategory(category))
      return undefined;
    return getMatchedRouteState(routeState, { categoryId, type, category, tabKey });
  }, [category, categoryId, routeState, tabKey, type]);

  const { data, isError, isFetching } = useGetChartQuery({
    params: {
      type: isAmountType(type) ? type : 'sub',
      category: isTimeRangeCategory(category) ? category : 'week',
      categoryId: categoryId || undefined,
    },
    options: { enabled: hasRequiredParams },
  });

  const periodsFromData = useMemo(() => {
    if (!isTimeRangeCategory(category))
      return [];
    return getPeriodsFromData(data, category);
  }, [category, data]);

  const periodFromState = useMemo(() => getPeriodFromState(matchedRouteState || null), [matchedRouteState]);
  const selectedPeriod = useMemo(() =>
    periodFromState || periodsFromData.find(item => item.key === tabKey) || periodsFromData.at(-1), [periodFromState, periodsFromData, tabKey]);

  const rankingItem = useMemo(() =>
    matchedRouteState?.rankingItem || selectedPeriod?.ranking?.find(item => String(item.category.id) === categoryId), [categoryId, matchedRouteState?.rankingItem, selectedPeriod]);

  const records = (selectedPeriod?.records || []).filter(record => String(record.category.id) === categoryId);
  const totalAmount = rankingItem?.amount ?? (records.length ? getRecordsAmount(records) : undefined);
  const percentage = rankingItem?.percentage;
  const percentageValue = Math.min(100, Math.max(0, Number(percentage) || 0));
  const categoryInfo = rankingItem?.category || records[0]?.category;
  const periodName = matchedRouteState?.tabName || selectedPeriod?.name;
  const currentType = isAmountType(type) ? type : matchedRouteState?.amountType;
  const currentCategory = isTimeRangeCategory(category) ? category : matchedRouteState?.timeRangeCategory;
  const hasMatchedDisplayData = !!rankingItem || records.length > 0;
  const tone = currentType === 'add' ? 'text-[#16886f]' : 'text-primary-deep';

  const renderPageState = (kind: 'error' | 'missing') => (
    <div className="page-new relative overflow-hidden">
      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button
          aria-label={t('common:nav.back')}
          className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{t('categoryDetail')}</h1>
      </header>
      <main className="flex min-h-0 flex-grow items-center px-[18px] pb-12">
        <GradientPanel className="w-full" elevation="low" surface="glass">
          <IllustratedEmptyState
            description={kind === 'missing' ? t('missingParamsHint') : t('loadFailHint')}
            icon={kind === 'missing' ? <BarChart3 className="text-primary-deep" size={38} /> : <CircleAlert className="text-primary-deep" size={38} />}
            title={kind === 'missing' ? t('missingParams') : t('loadFail')}
          />
        </GradientPanel>
      </main>
    </div>
  );

  if (!hasRequiredParams)
    return renderPageState('missing');

  if (isError && !hasMatchedDisplayData)
    return renderPageState('error');

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-[46%] h-56 w-56 rounded-full bg-ww-pink-light/30 blur-3xl" />

      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-center px-[18px] pt-[max(8px,env(safe-area-inset-top))]">
        <button
          aria-label={t('common:nav.back')}
          className="absolute left-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[17px] font-extrabold text-ww-ink">{t('categoryDetail')}</h1>
      </header>

      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px] space-y-5">
          <GradientPanel className="relative overflow-hidden px-5 pb-5 pt-[18px]" elevation="high" surface="chart">
            <div aria-hidden="true" className="absolute -right-7 -top-9 h-32 w-32 rounded-full border-[22px] border-solid border-white/25" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/80 bg-white/75 text-primary-deep shadow-ww-xs">
                <CategoryIcon categoryName={categoryInfo?.name} iconKey={categoryInfo?.icon} size={23} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[18px] font-black leading-7 text-ww-ink">{categoryInfo?.name || t('categoryStat')}</h2>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-ww-mid">
                  {periodName || t('currentPeriod')}
                  {currentType ? ` · ${t(`amount.${currentType === 'sub' ? 'expend' : 'income'}`)}` : ''}
                  {currentCategory ? ` · ${t('byPeriod', { period: t(`tabs.${currentCategory}`) })}` : ''}
                </p>
              </div>
            </div>

            <div className="relative mt-6 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-ww-mid">{t('categoryAmount')}</p>
                <p className={`mt-1 truncate font-number text-[32px] font-black leading-10 tracking-[-0.8px] ${tone}`}>
                  <span className="mr-1 text-[16px] font-extrabold">¥</span>
                  {displayAmount(totalAmount)}
                </p>
              </div>
              <div className="shrink-0 rounded-[14px] border border-white/80 bg-white/60 px-3.5 py-2 text-right backdrop-blur-sm">
                <p className="text-[10px] font-semibold text-ww-soft">{t('percent')}</p>
                <p className="font-number text-[18px] font-black text-ww-ink">{percentage === undefined ? '--' : `${percentage}%`}</p>
              </div>
            </div>
            <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/55">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6fc2dc,#58aec8)] transition-[width] duration-500"
                style={{ width: `${percentageValue}%` }}
              />
            </div>
          </GradientPanel>

          <section aria-label={t('categoryOverview')} className="grid grid-cols-3 gap-2.5">
            {[
              { icon: CalendarDays, label: t('periodTotal'), value: displayAmount(selectedPeriod?.amount) },
              { icon: TrendingUp, label: t('average'), value: selectedPeriod?.average || '--' },
              { icon: ReceiptText, label: t('recordCount'), value: t('recordCountValue', { count: records.length }) },
            ].map(item => (
              <GradientPanel className="min-w-0 px-3 py-3.5" elevation="low" key={item.label} surface="glass">
                <item.icon className="text-primary-deep" size={16} strokeWidth={1.8} />
                <p className="mt-2 truncate text-[10px] font-semibold text-ww-soft">{item.label}</p>
                <p className="mt-0.5 truncate font-number text-[13px] font-extrabold text-ww-ink">{item.value}</p>
              </GradientPanel>
            ))}
          </section>

          <section>
            <div className="mb-2.5 flex items-end justify-between px-1">
              <div>
                <h2 className="text-[15px] font-extrabold leading-6 text-ww-ink">{t('recordList')}</h2>
                <p className="text-[11px] leading-4 text-ww-soft">{t('recordListHint')}</p>
              </div>
              {isFetching && <SpinLoading color="primary" style={{ '--size': '18px' }} />}
            </div>

            <GradientPanel className="overflow-hidden px-4 py-1.5" elevation="standard" surface="glass">
              {records.map(record => (
                <button
                  className="flex min-h-[66px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent py-2.5 text-left last:border-b-0"
                  data-chart-category-record={record.id}
                  key={record.id}
                  onClick={() => navigate(`/editing/${record.id}`, { state: record })}
                  type="button"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light/55 text-primary-deep">
                    <CategoryIcon categoryName={record.category.name} iconKey={record.category.icon} size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold leading-5 text-ww-ink">{record.remark || record.category.name}</span>
                    <span className="mt-0.5 block font-number text-[10px] leading-4 text-ww-soft">{displayRecordDate(record.time)}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block font-number text-[13px] font-extrabold ${record.type === 'add' ? 'text-[#16886f]' : 'text-ww-ink'}`}>
                      {record.type === 'sub' ? '-' : '+'}
                      ¥
                      {displayAmount(record.amount)}
                    </span>
                  </span>
                  <ChevronRight className="shrink-0 text-ww-ghost" size={15} />
                </button>
              ))}

              {!records.length && !isFetching && (
                <IllustratedEmptyState
                  className="min-h-[270px]"
                  description={t('noRecordsHint')}
                  icon={<ReceiptText className="text-primary-deep" size={38} />}
                  testId="chart-category-empty"
                  title={t('noRecords')}
                />
              )}

              {!records.length && isFetching && (
                <div className="flex min-h-[220px] items-center justify-center">
                  <SpinLoading color="primary" />
                </div>
              )}
            </GradientPanel>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ChartCategory;
