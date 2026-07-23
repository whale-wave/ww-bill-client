import { Button, SafeArea } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';

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
                <strong>保存排序</strong>
                <small>拖动账本可修改排序</small>
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
                创建账本
              </span>
            </Button>
          )}
      <SafeArea position="bottom" />
    </footer>
  );
}
