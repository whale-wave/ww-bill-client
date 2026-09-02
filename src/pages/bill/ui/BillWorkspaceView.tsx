import type { GetRecordBillApiResponseData } from '@/entities/record';
import { Button as AdmButton, ErrorBlock } from 'antd-mobile';
import dayjs from 'dayjs';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentWorkspaceBack } from '@/features/workspace-navigation';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';
import { BillTabs } from '@/pages/bill/BillTabs';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import Content from '@/pages/bill/ui/Content';
import { ROUTES_PATH } from '@/shared/config/routes';
import { PageHeader, PageLoadingState, Button as WwButton } from '@/shared/ui';

interface BillQueryState {
  data?: GetRecordBillApiResponseData;
  response?: unknown;
  isError?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
  refetch?: () => unknown;
}

function BillWorkspaceContent({ query, onMonthSelect }: { query: BillQueryState; onMonthSelect?: (period: string) => void }) {
  const { t } = useTranslation('bill');
  const isMonth = useBillPageStore(({ billTabType }) => billTabType === BillTabsType.MONTH);
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const source = query.data?.list;
    if (!source)
      return [];

    return Object.keys(source)
      .sort((left, right) => Number(right) - Number(left))
      .map(period => ({
        balance: source[period]!.balance,
        expand: source[period]!.expand,
        income: source[period]!.income,
        period: isMonth ? `${dayjs(selectDate).year()}-${String(Number(period)).padStart(2, '0')}` : period,
        month: `${period}${isMonth ? t('month') : t('year')}`,
      }));
  }, [isMonth, query.data?.list, selectDate, t]);
  const hasData = Boolean(query.response ?? query.data);

  useLayoutEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop = 0;
  }, [isMonth]);

  return (
    <div
      className="relative min-h-0 flex-grow overflow-auto px-[18px] pb-4"
      data-testid="bill-scroll-container"
      ref={scrollContainerRef}
    >
      {query.isLoading && !hasData && (
        <PageLoadingState label={t('common:nav.loading')} testId="bill-loading" />
      )}
      {query.isError && !hasData && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
          <ErrorBlock />
          {query.refetch && (
            <AdmButton onClick={() => void query.refetch?.()} size="small">
              {t('common:retry')}
            </AdmButton>
          )}
        </div>
      )}
      {hasData && (
        <>
          <BillRecordCard data={query.data?.all} />
          <Content data={list} onMonthSelect={onMonthSelect} />
        </>
      )}
      {hasData && query.isFetching && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-deep shadow-ww-xs">
          {t('common:nav.loading')}
        </div>
      )}
    </div>
  );
}

export function PersonalBillWorkspaceView({ query }: { query: BillQueryState }) {
  const { t } = useTranslation('bill');
  const navigate = useNavigate();

  return (
    <div className="page-new overflow-hidden">
      <header className="flex h-[60px] shrink-0 items-center justify-center px-[22px] pb-4 pt-[max(8px,env(safe-area-inset-top))]">
        <h1 className="text-[20px] font-extrabold leading-[30px] text-ww-ink">{t('title')}</h1>
      </header>
      <div className="flex flex-grow flex-col overflow-hidden">
        <BillTabs />
        <BillWorkspaceContent
          onMonthSelect={period => navigate(ROUTES_PATH.BILL_MONTH_DETAIL.getPath(period))}
          query={query}
        />
      </div>
      <div className="shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <WwButton
          className="ww-theme-primary-action !h-12 !rounded-[16px] !font-bold"
          size="full"
          onClick={() => navigate(-1)}
        >
          {t('back')}
        </WwButton>
      </div>
    </div>
  );
}

export function LedgerBillWorkspaceView({
  onMonthSelect,
  query,
}: {
  onMonthSelect: (period: string) => void;
  query: BillQueryState;
}) {
  const { t } = useTranslation('bill');
  const onBack = useCurrentWorkspaceBack();

  return (
    <div className="page-new overflow-hidden">
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('title')} />
      <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
        <BillTabs />
        <BillWorkspaceContent onMonthSelect={onMonthSelect} query={query} />
      </div>
      <div className="shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <WwButton
          className="ww-theme-primary-action !h-12 !rounded-[16px] !font-bold"
          size="full"
          onClick={onBack}
        >
          {t('back')}
        </WwButton>
      </div>
    </div>
  );
}
