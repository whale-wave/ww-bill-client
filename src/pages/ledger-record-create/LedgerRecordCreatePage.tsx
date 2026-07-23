import { NavBar } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerRecordForm } from '@/features/ledger-record-form';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export default function LedgerRecordCreatePage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const handleBack = () => {
    if (!ledgerId) {
      navigate(-1);
      return;
    }
    navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId), { replace: true });
  };
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={handleBack}>{t('records.create')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_CREATE}>{({ ledgerId }) => <LedgerRecordForm ledgerId={ledgerId} onSaved={() => navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId), { replace: true })} />}</LedgerScopeBoundary>
    </div>
  );
}
