import { ErrorBlock, NavBar, SpinLoading } from 'antd-mobile';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import { useLedgerRecordsQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function CalendarContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const query = useLedgerRecordsQuery({ params: { ledgerId, filters: { startDate: date, endDate: date } } });
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  if (query.isLoading)
    return <SpinLoading />;
  if (query.isError)
    return <ErrorBlock />;
  return (
    <>
      <div className="bg-white p-4"><input className="min-h-[44px] w-full border border-solid border-[#EBEBEB] px-2" onChange={event => setDate(event.target.value)} type="date" value={date} /></div>
      {preferenceQuery.data?.showDailySummary && (
        <div className="bg-primary px-4 py-3 text-sm text-font-black" data-testid="ledger-daily-summary">
          {t('records.summary', preferenceQuery.data.hideTotalAmount
            ? { expense: '••••', income: '••••' }
            : { expense: query.data.expend, income: query.data.income })}
        </div>
      )}
      {query.data.data.map(record => (
        <button className="flex min-h-[59px] w-full items-center justify-between border-0 border-b border-solid border-[#EBEBEB] bg-white px-4" key={record.id} onClick={() => navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, record.id))} type="button">
          <span>{record.remark}</span>
          <span>{record.amount}</span>
        </button>
      ))}
    </>
  );
}

export default function LedgerCalendarPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('records.calendar')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>{({ ledgerId }) => <CalendarContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
