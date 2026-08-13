import type { LedgerListItem } from '@/entities/ledger';
import { Grid } from 'antd-mobile';
import { LedgerCoverCard } from '@/entities/ledger';
import { useTranslation } from '@/shared/i18n';

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
  const { t } = useTranslation('ledger');

  return (
    <div
      aria-label={t('center.customGrid')}
      className="ledger-management-grid"
      data-columns="2"
      data-testid="ledger-management-grid"
      role="list"
    >
      <Grid columns={2} gap={[14, 16]}>
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
