import type { Ledger } from '@/entities/ledger';
import { LedgerCapability, useLedgerPreferencesQuery } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ChartDashboardHome } from '@/pages/chart/chart-home/ChartDashboardHome';
import { LedgerWorkspaceTabBar } from '@/widgets/layout';

function LedgerChartsWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  return (
    <>
      <ChartDashboardHome
        defaultPeriod="month"
        hideAmounts={preferenceQuery.data?.hideTotalAmount === true}
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
