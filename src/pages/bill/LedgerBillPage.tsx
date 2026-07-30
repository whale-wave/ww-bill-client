import { LedgerCapability } from '@/entities/ledger';
import { useLedgerRecordBillQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { LedgerBillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';

function LedgerBillContent({ ledgerId }: { ledgerId: string }) {
  const filters = useBillWorkspaceQueryParams();
  const query = useLedgerRecordBillQuery({
    params: { filters, ledgerId },
  });

  return <LedgerBillWorkspaceView query={query} />;
}

export default function LedgerBillPage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>
      {({ ledgerId }) => <LedgerBillContent ledgerId={ledgerId} />}
    </LedgerScopeBoundary>
  );
}
