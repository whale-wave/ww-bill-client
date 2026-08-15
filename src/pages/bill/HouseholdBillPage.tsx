import { useParams } from 'react-router-dom';
import { useHouseholdRecordBillQuery } from '@/entities/record';
import { HouseholdScopeBoundary } from '@/features/household';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { LedgerBillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';

function HouseholdBillContent({ householdId }: { householdId: string }) {
  const filters = useBillWorkspaceQueryParams();
  const query = useHouseholdRecordBillQuery({
    params: { filters, householdId },
  });

  return <LedgerBillWorkspaceView query={query} />;
}

export default function HouseholdBillPage() {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <HouseholdScopeBoundary householdId={householdId}>
      {({ id }) => <HouseholdBillContent householdId={id} />}
    </HouseholdScopeBoundary>
  );
}
