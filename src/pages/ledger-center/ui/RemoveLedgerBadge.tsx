import { MinusOutline } from 'antd-mobile-icons';

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
  const actionLabel = action === 'archive' ? '归档' : '退出';

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
      title={disabled ? '账本已被平台暂停，暂不能归档或退出' : `${actionLabel} ${ledgerName}`}
      type="button"
    >
      <MinusOutline aria-hidden="true" />
    </button>
  );
}
