import type { GetRecordBillApiResponseData } from '@/entities/record';
import { Button, DatePicker, ErrorBlock, NavBar, SpinLoading } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';
import { BillTabs } from '@/pages/bill/BillTabs';
import { useBillPageStore } from '@/pages/bill/model';
import Content from '@/pages/bill/ui/Content';
import { ROUTES_PATH } from '@/shared/config/routes';

interface BillQueryState {
  data?: GetRecordBillApiResponseData;
  isError?: boolean;
  isLoading?: boolean;
  refetch?: () => unknown;
}

function BillWorkspaceContent({ query }: { query: BillQueryState }) {
  const { t } = useTranslation('bill');
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const setSelectDate = useBillPageStore(({ setSelectDate }) => setSelectDate);
  const isMonth = useBillPageStore(({ getIsMonthTabType }) => getIsMonthTabType());
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

  const handleSelectYear = () => {
    if (!isMonth)
      return;
    void DatePicker.prompt({
      defaultValue: selectDate ?? new Date(),
      onConfirm: setSelectDate,
      precision: 'year',
      renderLabel: (_, value) => `${value}${t('year')}`,
    });
  };

  return (
    <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
      {isMonth && (
        <button
          className="flex min-h-[42px] flex-shrink-0 items-center gap-1 border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 text-left text-sm text-black333"
          data-testid="bill-year-selector"
          onClick={handleSelectYear}
          type="button"
        >
          {dayjs(selectDate).format(`YYYY${t('year')}`)}
          <DownFill aria-hidden="true" className="text-xs" />
        </button>
      )}
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
              <Button onClick={() => void query.refetch?.()} size="small">
                {t('common:retry')}
              </Button>
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
      <Button block className="flex-shrink-0" data-testid="bill-back-action" onClick={() => navigate(-1)}>
        {t('back')}
      </Button>
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
  const navigate = useNavigate();

  return (
    <div className="page overflow-hidden bg-bg-gray">
      <NavBar onBack={() => navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId))}>
        <BillTabs />
      </NavBar>
      <BillWorkspaceContent query={query} />
      <Button
        block
        className="flex-shrink-0"
        data-testid="bill-back-action"
        onClick={() => navigate(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId))}
      >
        返回账本详情
      </Button>
    </div>
  );
}
