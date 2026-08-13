import { Button, SafeArea } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useTranslation } from '@/shared/i18n';

interface LedgerManagementFooterProps {
  isSaving?: boolean;
  onCreate: () => void;
  onSave: () => void;
  sorting: boolean;
}

export function LedgerManagementFooter({
  isSaving = false,
  onCreate,
  onSave,
  sorting,
}: LedgerManagementFooterProps) {
  const { t } = useTranslation('ledger');

  return (
    <footer className={`ledger-management-footer${sorting ? ' ledger-management-footer--sorting' : ''}`}>
      {sorting
        ? (
            <Button
              block
              color="primary"
              data-testid="ledger-order-save"
              loading={isSaving}
              onClick={onSave}
              size="large"
            >
              <span className="ledger-management-footer__save-copy">
                <strong>{t('center.saveOrder')}</strong>
                <small>{t('center.sortHint')}</small>
              </span>
            </Button>
          )
        : (
            <Button
              block
              className="ledger-management-footer__create"
              data-testid="ledger-create"
              fill="none"
              onClick={onCreate}
              size="large"
            >
              <span className="ledger-management-footer__create-copy">
                <AddOutline aria-hidden="true" />
                {t('center.create')}
              </span>
            </Button>
          )}
      <SafeArea position="bottom" />
    </footer>
  );
}
