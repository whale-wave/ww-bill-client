import { NavBar, SpinLoading } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useLedgerRecordQuery } from '@/entities/record';
import { LedgerRecordForm } from '@/features/ledger-record-form';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function EditContent({ ledgerId }: { ledgerId: string }) {
  const navigate = useNavigate();
  const { recordId = '' } = useParams<{ recordId: string }>();
  const query = useLedgerRecordQuery({ params: { ledgerId, recordId }, queryOptions: { enabled: Boolean(recordId) } });
  if (!query.data)
    return <SpinLoading />;
  return <LedgerRecordForm initialRecord={query.data} ledgerId={ledgerId} onSaved={() => navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId), { replace: true })} />;
}

export default function LedgerRecordEditPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('records.edit')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_UPDATE}>{({ ledgerId }) => <EditContent ledgerId={ledgerId} />}</LedgerScopeBoundary>
    </div>
  );
}
