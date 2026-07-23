import type { LedgerListItem } from '@/entities/ledger';
import { Grid } from 'antd-mobile';
import { LedgerCoverCard } from '@/entities/ledger';

interface LedgerManagementGridProps {
  ledgers: readonly LedgerListItem[];
  onEnterSortMode: () => void;
  onOpen: (ledgerId: string) => void;
}

export function LedgerManagementGrid({
  ledgers,
  onEnterSortMode,
  onOpen,
}: LedgerManagementGridProps) {
  return (
    <div
      aria-label="自定义账本"
      className="ledger-management-grid"
      data-columns="3"
      data-testid="ledger-management-grid"
      role="list"
    >
      <Grid columns={3} gap={[14, 16]}>
        {ledgers.map(ledger => (
          <Grid.Item key={ledger.id}>
            <div role="listitem">
              <LedgerCoverCard
                ledger={ledger}
                onEnterSortMode={onEnterSortMode}
                onOpen={() => onOpen(ledger.id)}
              />
            </div>
          </Grid.Item>
        ))}
      </Grid>
    </div>
  );
}
