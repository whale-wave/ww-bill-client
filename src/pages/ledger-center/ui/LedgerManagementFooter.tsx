import { SafeArea } from 'antd-mobile';
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
            <button
              className="ledger-management-footer__save-button"
              data-testid="ledger-order-save"
              disabled={isSaving}
              onClick={onSave}
              type="button"
            >
              <span className="ledger-management-footer__save-copy">
                <strong>{isSaving ? t('center.savingOrder') : t('center.saveOrder')}</strong>
                <small>{t('center.sortHint')}</small>
              </span>
            </button>
          )
        : (
            <button
              className="ledger-management-footer__create"
              data-testid="ledger-create"
              onClick={onCreate}
              type="button"
            >
              <span className="ledger-management-footer__create-copy">
                <AddOutline aria-hidden="true" />
                {t('center.create')}
              </span>
            </button>
          )}
      <SafeArea position="bottom" />
    </footer>
  );
}
