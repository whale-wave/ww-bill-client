import type { GetRecordBillApiResponseData } from '@/entities/record';
import { Button, DatePicker, ErrorBlock, SpinLoading } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LedgerSwitcherHeader } from '@/features/ledger-switcher';
import { BillRecordCard } from '@/pages/bill/BillRecordCard';
import { BillTabs } from '@/pages/bill/BillTabs';
import { useBillPageStore } from '@/pages/bill/model';
import Content from '@/pages/bill/ui/Content';

interface BillQueryState {
  data?: GetRecordBillApiResponseData;
  isError?: boolean;
  isLoading?: boolean;
  refetch?: () => unknown;
}

export function BillWorkspaceView({ query }: { query: BillQueryState }) {
  const { t } = useTranslation('bill');
  const navigate = useNavigate();
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
    <div className="page overflow-hidden bg-bg-gray">
      <LedgerSwitcherHeader titleContent={<BillTabs />} />
      <div className="flex min-h-0 flex-grow flex-col overflow-hidden">
        {isMonth && (
          <button
            className="flex min-h-[42px] flex-shrink-0 items-center gap-1 border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 text-left text-sm text-black333"
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
      <Button block className="flex-shrink-0" onClick={() => navigate(-1)}>
        {t('back')}
      </Button>
    </div>
  );
}
