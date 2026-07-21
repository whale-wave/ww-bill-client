import type { ReactNode } from 'react';
import type { Ledger, LedgerCapability } from '@/entities/ledger';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { useParams } from 'react-router-dom';
import { useLedgerQuery } from '@/entities/ledger';
import { useTranslation } from '@/shared/i18n';

export interface LedgerScope {
  ledger: Ledger;
  ledgerId: string;
}

interface LedgerScopeBoundaryProps {
  capability?: LedgerCapability;
  children: (scope: LedgerScope) => ReactNode;
}

export function LedgerScopeBoundary({
  capability,
  children,
}: LedgerScopeBoundaryProps) {
  const { t } = useTranslation('ledger');
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });

  if (!ledgerId) {
    return (
      <ErrorBlock
        description={t('common.invalidLedgerDescription')}
        status="default"
        title={t('common.invalidLedger')}
      />
    );
  }

  if (ledgerQuery.isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <SpinLoading />
      </div>
    );
  }

  if (ledgerQuery.isError || !ledgerQuery.data) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-4">
        <ErrorBlock
          description={t('common.loadErrorDescription')}
          status="default"
          title={t('common.loadError')}
        />
        <Button onClick={async () => { await ledgerQuery.refetch(); }} size="small">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (capability && !ledgerQuery.data.capabilities.includes(capability)) {
    return (
      <ErrorBlock
        description={t('common.noPermissionDescription')}
        status="default"
        title={t('common.noPermission')}
      />
    );
  }

  return children({ ledger: ledgerQuery.data, ledgerId });
}
