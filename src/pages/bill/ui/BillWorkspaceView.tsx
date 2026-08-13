import type { GetRecordBillApiResponseData } from '@/entities/record';
import { Button as AdmButton, ErrorBlock, NavBar, SpinLoading } from 'antd-mobile';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentWorkspaceBack } from '@/features/workspace-navigation';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';
import { BillTabs } from '@/pages/bill/BillTabs';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import Content from '@/pages/bill/ui/Content';
import { Button as WwButton } from '@/shared/ui';

interface BillQueryState {
  data?: GetRecordBillApiResponseData;
  isError?: boolean;
  isLoading?: boolean;
  refetch?: () => unknown;
}

function BillWorkspaceContent({ query }: { query: BillQueryState }) {
  const { t } = useTranslation('bill');
  const isMonth = useBillPageStore(({ billTabType }) => billTabType === BillTabsType.MONTH);
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
        month: `${period}${isMonth ? t('month') : t('year')}`,
      }));
  }, [isMonth, query.data?.list, t]);

  useLayoutEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop = 0;
  }, [isMonth]);

  return (
    <div
      className="min-h-0 flex-grow overflow-auto px-[18px] pb-4"
      data-testid="bill-scroll-container"
      ref={scrollContainerRef}
    >
      {query.isLoading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <SpinLoading />
        </div>
      )}
      {!query.isLoading && query.isError && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
          <ErrorBlock />
          {query.refetch && (
            <AdmButton onClick={() => void query.refetch?.()} size="small">
              {t('common:retry')}
            </AdmButton>
          )}
        </div>
      )}
      {!query.isLoading && !query.isError && (
        <>
          <BillRecordCard data={query.data?.all} />
          <Content data={list} />
        </>
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
        <BillWorkspaceContent query={query} />
      </div>
      <div className="shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <WwButton
          className="!h-12 !rounded-[16px] !bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] !font-bold !text-white !shadow-ww"
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
  query,
}: {
  query: BillQueryState;
}) {
  const { t } = useTranslation('bill');
  const onBack = useCurrentWorkspaceBack();

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>
        {t('title')}
      </NavBar>
      <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
        <BillTabs />
        <BillWorkspaceContent query={query} />
      </div>
      <div className="shrink-0 px-[18px] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <WwButton
          className="!h-12 !rounded-[16px] !bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] !font-bold !text-white !shadow-ww"
          size="full"
          onClick={onBack}
        >
          {t('back')}
        </WwButton>
      </div>
    </div>
  );
}
