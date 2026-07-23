import type { Ledger } from '@/entities/ledger';
import { Button, ErrorBlock, SearchBar, SpinLoading } from 'antd-mobile';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import { useLedgerRecordsQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { LedgerSwitcherHeader } from '@/features/ledger-switcher';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

function RecordsContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const filters = useMemo(() => ({ ...(keyword ? { keyword } : {}) }), [keyword]);
  const query = useLedgerRecordsQuery({ params: { filters, ledgerId } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });

  if (query.isLoading)
    return <div className="flex min-h-[280px] items-center justify-center"><SpinLoading /></div>;
  if (query.isError)
    return <ErrorBlock description={t('common.loadErrorDescription')} title={t('common.loadError')} />;

  return (
    <>
      <div className="flex gap-2 bg-white px-4 py-3">
        <SearchBar className="flex-grow" defaultValue={keyword} onSearch={value => setSearchParams(value ? { keyword: value } : {})} placeholder={t('records.search')} />
        <Button onClick={() => navigate(ROUTES_PATH.LEDGER_CALENDAR.getPath(ledgerId))} size="small">{t('records.calendar')}</Button>
      </div>
      <div className="bg-primary px-4 py-3 text-sm text-font-black" data-testid="ledger-record-summary">
        {t('records.summary', preferenceQuery.data?.hideTotalAmount
          ? { expense: '••••', income: '••••' }
          : { expense: query.data.expend, income: query.data.income })}
      </div>
      {query.data.data.map(record => (
        <button className="flex min-h-[59px] w-full items-center border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 text-left" key={record.id} onClick={() => navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id))} type="button">
          <span className="min-w-0 flex-grow">
            <strong className="block one-line font-normal">{record.remark}</strong>
            <small className="text-font-gray">
              {record.category.name}
              {' '}
              ·
              {' '}
              {dayjs(record.time).format('YYYY-MM-DD')}
            </small>
          </span>
          <span>
            {record.type === 'sub' ? '-' : '+'}
            {record.amount}
          </span>
        </button>
      ))}
    </>
  );
}

function LedgerRecordsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  return (
    <>
      <LedgerSwitcherHeader ledgerName={ledger.name} />
      <main className="min-h-0 flex-grow overflow-auto pb-3">
        <RecordsContent ledgerId={ledgerId} />
      </main>
      <LedgerWorkspaceTabBar
        activeKey="records"
        capabilities={ledger.capabilities}
        ledgerId={ledgerId}
      />
    </>
  );
}

export default function LedgerRecordsPage() {
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
        {scope => <LedgerRecordsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
