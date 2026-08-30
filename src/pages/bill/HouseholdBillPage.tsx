import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdRecordBillQuery } from '@/entities/record';
import { HouseholdScopeBoundary } from '@/features/household';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { LedgerBillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';
import { ROUTES_PATH } from '@/shared/config/routes';

function HouseholdBillContent({ householdId }: { householdId: string }) {
  const navigate = useNavigate();
  const filters = useBillWorkspaceQueryParams();
  const query = useHouseholdRecordBillQuery({
    params: { filters, householdId },
  });

  return <LedgerBillWorkspaceView onMonthSelect={month => navigate(ROUTES_PATH.HOUSEHOLD_MONTH_BILL_DETAIL.getPath(householdId, month))} query={query} />;
}

export default function HouseholdBillPage() {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <HouseholdScopeBoundary householdId={householdId}>
      {({ id }) => <HouseholdBillContent householdId={id} />}
    </HouseholdScopeBoundary>
  );
}
