import type { LedgerListItem } from '@/entities/ledger';
import {
  Button,
  Dialog,
  ErrorBlock,
  NavBar,
  SafeArea,
  SpinLoading,
  Toast,
} from 'antd-mobile';
import { SetOutline } from 'antd-mobile-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router-dom';
import {
  LedgerKind,
  LedgerRole,
  LedgerStatus,
  useArchiveLedgerMutation,
  useLeaveLedgerMutation,
  useLedgerManagementQuery,
  useReorderLedgersMutation,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { LedgerManagementFooter } from './ui/LedgerManagementFooter';
import { LedgerManagementGrid } from './ui/LedgerManagementGrid';
import { SortableLedgerGrid } from './ui/SortableLedgerGrid';
import './ledger-center.scss';

function isConflict(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && error.statusCode === 409;
}

function hasSameOrder(
  left: readonly LedgerListItem[],
  right: readonly LedgerListItem[],
) {
  return left.length === right.length
    && left.every((ledger, index) => ledger.id === right[index]?.id);
}

function LedgerCenterPage() {
  const navigate = useNavigate();
  const managementQuery = useLedgerManagementQuery();
  const [reorderLedgers, reorderState] = useReorderLedgersMutation();
  const [archiveLedger, archiveState] = useArchiveLedgerMutation();
  const [leaveLedger, leaveState] = useLeaveLedgerMutation();
  const [sorting, setSorting] = useState(false);
  const [draft, setDraft] = useState<LedgerListItem[]>([]);

  const customLedgers = useMemo(
    () => managementQuery.data.filter(ledger => ledger.kind === LedgerKind.CUSTOM),
    [managementQuery.data],
  );
  const dirty = sorting && !hasSameOrder(draft, customLedgers);
  const blocker = useBlocker(dirty);
  const blockerDialogOpenRef = useRef(false);
  const isMountedRef = useRef(true);
  const isMutating = reorderState.isLoading
    || archiveState.isLoading
    || leaveState.isLoading;

  const resetDraft = () => {
    setDraft(customLedgers);
    setSorting(false);
  };

  const refreshAfterConflict = async () => {
    resetDraft();
    await managementQuery.refetch();
    Toast.show({
      content: '账本列表已更新，请重新排序',
      icon: 'fail',
    });
  };

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    if (blocker.state !== 'blocked' || blockerDialogOpenRef.current)
      return;

    blockerDialogOpenRef.current = true;
    void Dialog.confirm({
      cancelText: '继续排序',
      confirmText: '放弃',
      content: '当前排序尚未保存，离开后更改会丢失。',
      title: '放弃排序？',
    }).then((confirmed) => {
      if (!isMountedRef.current)
        return;
      blockerDialogOpenRef.current = false;
      if (blocker.state !== 'blocked')
        return;
      if (confirmed)
        blocker.proceed();
      else
        blocker.reset();
    });
  }, [blocker]);

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (!dirty)
      return;
    event.preventDefault();
    event.returnValue = '';
  }, [dirty]);
  useBeforeUnload(handleBeforeUnload);

  const handleBack = () => {
    navigate(-1);
  };

  const enterSortMode = () => {
    setDraft(customLedgers);
    setSorting(true);
  };

  const handleSave = async () => {
    if (isMutating)
      return;
    try {
      await reorderLedgers({
        items: draft.map(ledger => ({
          ledgerId: ledger.id,
          memberVersion: ledger.myMembership.version,
        })),
      });
      setSorting(false);
      Toast.show({ content: '账本排序已保存', icon: 'success' });
    }
    catch (error) {
      if (isConflict(error)) {
        await refreshAfterConflict();
        return;
      }
      Toast.show({ content: '保存排序失败，请稍后重试', icon: 'fail' });
    }
  };

  const handleRemove = async (ledger: LedgerListItem) => {
    if (ledger.status === LedgerStatus.SUSPENDED) {
      Toast.show({ content: '账本已被平台暂停，暂不能归档或退出' });
      return;
    }
    if (isMutating)
      return;

    const isOwner = ledger.myRole === LedgerRole.OWNER;
    const actionLabel = isOwner ? '归档' : '退出';
    const confirmed = await Dialog.confirm({
      cancelText: '取消',
      confirmText: actionLabel,
      content: isOwner
        ? '归档后该账本及其记录将不再出现在你的账本列表中。'
        : '退出后将无法继续查看或记录此账本。',
      title: `${actionLabel}“${ledger.name}”？`,
    });
    if (!confirmed)
      return;

    try {
      if (isOwner) {
        await archiveLedger({
          data: { confirmed: true, version: ledger.version },
          ledgerId: ledger.id,
        });
      }
      else {
        await leaveLedger({
          ledgerId: ledger.id,
          version: ledger.myMembership.version,
        });
      }
      setDraft(current => current.filter(item => item.id !== ledger.id));
      Toast.show({ content: `已${actionLabel}${ledger.name}`, icon: 'success' });
    }
    catch (error) {
      if (isConflict(error)) {
        await refreshAfterConflict();
        return;
      }
      Toast.show({ content: `${actionLabel}账本失败，请稍后重试`, icon: 'fail' });
    }
  };

  const renderContent = () => {
    if (managementQuery.isLoading) {
      return (
        <div className="ledger-center-state" data-testid="ledger-center-loading">
          <SpinLoading />
          <span>正在加载账本</span>
        </div>
      );
    }

    if (managementQuery.isError) {
      return (
        <div className="ledger-center-state">
          <ErrorBlock
            description="请检查网络后重试。"
            status="default"
            title="账本加载失败"
          />
          <Button
            color="primary"
            data-testid="ledger-center-retry"
            onClick={() => void managementQuery.refetch()}
          >
            重新加载
          </Button>
        </div>
      );
    }

    if (!customLedgers.length) {
      return (
        <div className="ledger-center-empty">
          <ErrorBlock
            description="创建新账本，或通过邀请码加入他人账本。"
            status="empty"
            title="还没有自定义账本"
          />
          <div className="ledger-center-empty__actions">
            <Button
              color="primary"
              data-testid="ledger-empty-create"
              onClick={() => navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath())}
            >
              创建账本
            </Button>
            <Button
              data-testid="ledger-empty-join"
              onClick={() => navigate(ROUTES_PATH.LEDGER_JOIN.getPath())}
            >
              加入账本
            </Button>
          </div>
        </div>
      );
    }

    const suspendedNote = customLedgers.some(
      ledger => ledger.status === LedgerStatus.SUSPENDED,
    )
      ? (
          <p className="ledger-center-suspended-note" role="status">
            账本已被平台暂停，暂不能归档或退出
          </p>
        )
      : null;

    return (
      <>
        {suspendedNote}
        {sorting
          ? (
              <SortableLedgerGrid
                ledgers={draft}
                onOrderChange={setDraft}
                onRemove={ledger => void handleRemove(ledger)}
              />
            )
          : (
              <LedgerManagementGrid
                ledgers={customLedgers}
                onEnterSortMode={enterSortMode}
                onOpen={ledgerId => navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId))}
              />
            )}
      </>
    );
  };

  return (
    <div className="page-new ledger-center-page">
      <SafeArea position="top" />
      <NavBar
        back="返回"
        className="ledger-center-navbar"
        onBack={handleBack}
        right={(
          <Button
            aria-label="账本快捷设置"
            className="ledger-center-navbar__settings"
            fill="none"
            onClick={() => navigate(ROUTES_PATH.LEDGER_PREFERENCES.getPath())}
            size="small"
            type="button"
          >
            <SetOutline aria-hidden="true" />
          </Button>
        )}
      >
        账本管理
      </NavBar>
      <main className="ledger-center-content">
        {renderContent()}
      </main>
      {(
        !managementQuery.isLoading
        && !managementQuery.isError
        && customLedgers.length > 0
      ) && (
        <LedgerManagementFooter
          isSaving={reorderState.isLoading}
          onCreate={() => navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath())}
          onSave={() => void handleSave()}
          sorting={sorting}
        />
      )}
    </div>
  );
}

export default LedgerCenterPage;
