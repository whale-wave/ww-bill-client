import { MinusOutline } from 'antd-mobile-icons';
import { useTranslation } from '@/shared/i18n';

interface RemoveLedgerBadgeProps {
  action: 'archive' | 'leave';
  disabled?: boolean;
  ledgerName: string;
  onClick: () => void;
}

export function RemoveLedgerBadge({
  action,
  disabled = false,
  ledgerName,
  onClick,
}: RemoveLedgerBadgeProps) {
  const { t } = useTranslation('ledger');
  const actionLabel = t(action === 'archive' ? 'center.archive' : 'center.leave');

  return (
    <button
      aria-label={`${actionLabel} ${ledgerName}`}
      className="ledger-remove-badge"
      data-testid="ledger-remove-badge"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
      title={disabled ? t('center.suspended') : `${actionLabel} ${ledgerName}`}
      type="button"
    >
      <MinusOutline aria-hidden="true" />
    </button>
  );
}
