import { NavBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerRecordForm } from '@/features/ledger-record-form';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export default function LedgerRecordCreatePage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('records.create')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_CREATE}>{({ ledgerId }) => <LedgerRecordForm ledgerId={ledgerId} onSaved={() => navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId), { replace: true })} />}</LedgerScopeBoundary>
    </div>
  );
}
