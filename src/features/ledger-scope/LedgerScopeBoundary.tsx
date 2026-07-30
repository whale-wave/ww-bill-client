import type { ReactNode } from 'react';
import type { Ledger, LedgerCapability } from '@/entities/ledger';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { Navigate, useParams } from 'react-router-dom';
import { useLedgerQuery } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

export interface LedgerScope {
  ledger: Ledger;
  ledgerId: string;
}

interface LedgerScopeBoundaryProps {
  capability?: LedgerCapability;
  children: (scope: LedgerScope) => ReactNode;
  renderState?: (state: 'error' | 'invalid' | 'loading' | 'noPermission') => ReactNode;
}

function isDeterministicallyLostLedger(error: unknown) {
  if (typeof error !== 'object' || error === null || !('statusCode' in error))
    return false;

  return error.statusCode === 403 || error.statusCode === 404;
}

export function LedgerScopeBoundary({
  capability,
  children,
  renderState,
}: LedgerScopeBoundaryProps) {
  const { t } = useTranslation('ledger');
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });

  if (!ledgerId) {
    if (renderState)
      return renderState('invalid');
    return (
      <ErrorBlock
        description={t('common.invalidLedgerDescription')}
        status="default"
        title={t('common.invalidLedger')}
      />
    );
  }

  if (ledgerQuery.isLoading) {
    if (renderState)
      return renderState('loading');
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <SpinLoading />
      </div>
    );
  }

  if (ledgerQuery.isError && isDeterministicallyLostLedger(ledgerQuery.error))
    return <Navigate replace to={ROUTES_PATH.DETAIL.getPath()} />;

  if (ledgerQuery.isError || !ledgerQuery.data) {
    if (renderState)
      return renderState('error');
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
    if (renderState)
      return renderState('noPermission');
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
