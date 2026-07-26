import type { GetRecordBillApiResponseData } from '@/entities/record';
import { Button as AdmButton, ErrorBlock, NavBar, SpinLoading } from 'antd-mobile';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';
import { BillTabs } from '@/pages/bill/BillTabs';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import Content from '@/pages/bill/ui/Content';
import { ROUTES_PATH } from '@/shared/config/routes';
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

  return (
    <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
      <div className="min-h-0 flex-grow overflow-auto px-3 py-3">
        {query.isLoading && (
          <div className="flex min-h-[240px] items-center justify-center">
            <SpinLoading />
          </div>
        )}
        {!query.isLoading && query.isError && (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
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
    </div>
  );
}

export function PersonalBillWorkspaceView({ query }: { query: BillQueryState }) {
  const { t } = useTranslation('bill');
  const navigate = useNavigate();

  return (
    <div className="page overflow-hidden bg-bg-gray">
      <BillTabs />
      <BillWorkspaceContent query={query} />
      <WwButton size="full" onClick={() => navigate(-1)}>
        {t('back')}
      </WwButton>
    </div>
  );
}

export function LedgerBillWorkspaceView({
  ledgerId,
  query,
}: {
  ledgerId: string;
  query: BillQueryState;
}) {
  const { t } = useTranslation('bill');
  const navigate = useNavigate();

  return (
    <div className="page overflow-hidden bg-bg-gray">
      <NavBar onBack={() => navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId))}>
        {t('title')}
      </NavBar>
      <BillTabs />
      <BillWorkspaceContent query={query} />
      <WwButton
        size="full"
        onClick={() => navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId))}
      >
        返回账本详情
      </WwButton>
    </div>
  );
}
