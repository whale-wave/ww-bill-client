import type { Ledger } from '@/entities/ledger';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import { useLedgerAmountPreferences } from '@/features/display-preferences';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ChartDashboardHome } from '@/widgets/chart-dashboard';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

function LedgerChartsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const { hideTotalAmount } = useLedgerAmountPreferences(ledgerId, preferenceQuery.data);
  return (
    <>
      <ChartDashboardHome
        defaultPeriod="month"
        hideAmounts={hideTotalAmount}
        scope={{ kind: 'ledger', ledgerId }}
      />
      <LedgerWorkspaceTabBar
        activeKey="charts"
        capabilities={ledger.capabilities}
        ledgerId={ledgerId}
      />
    </>
  );
}

export default function LedgerChartsPage() {
  return (
    <div className="page-new overflow-hidden bg-white">
      <LedgerScopeBoundary capability={LedgerCapability.CHART_READ}>
        {scope => <LedgerChartsWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}
