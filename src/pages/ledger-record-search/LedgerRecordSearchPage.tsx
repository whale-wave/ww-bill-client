import { NavBar, SearchBar } from 'antd-mobile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export default function LedgerRecordSearchPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('records.search')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
        {({ ledgerId }) => <div className="bg-white p-4"><SearchBar defaultValue={searchParams.get('keyword') ?? ''} onSearch={keyword => navigate(`${ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId)}?keyword=${encodeURIComponent(keyword)}`, { replace: true })} placeholder={t('records.search')} /></div>}
      </LedgerScopeBoundary>
    </div>
  );
}
