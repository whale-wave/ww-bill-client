import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useLedgerRecordBillQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { LedgerBillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';
import { ROUTES_PATH } from '@/shared/config/routes';

function LedgerBillContent({ ledgerId }: { ledgerId: string }) {
  const navigate = useNavigate();
  const filters = useBillWorkspaceQueryParams();
  const query = useLedgerRecordBillQuery({
    params: { filters, ledgerId },
  });

  return <LedgerBillWorkspaceView onMonthSelect={month => navigate(ROUTES_PATH.LEDGER_MONTH_BILL_DETAIL.getPath(ledgerId, month))} query={query} />;
}

export default function LedgerBillPage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
      {({ ledgerId }) => <LedgerBillContent ledgerId={ledgerId} />}
    </LedgerScopeBoundary>
  );
}
