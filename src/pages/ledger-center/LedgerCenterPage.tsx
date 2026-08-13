import type { LedgerListItem } from '@/entities/ledger';
import {
  Button,
  Dialog,
  SpinLoading,
  Toast,
} from 'antd-mobile';
import { BookOpen, CircleAlert, Settings2 } from 'lucide-react';
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
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader } from '@/shared/ui';
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
  const { t } = useTranslation('ledger');
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
      content: t('center.listUpdated'),
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
      cancelText: t('center.continueSorting'),
      confirmText: t('center.discard'),
      content: t('center.discardSortDescription'),
      title: t('center.discardSortTitle'),
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
  }, [blocker, t]);

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
      Toast.show({ content: t('center.sortSaved'), icon: 'success' });
    }
    catch (error) {
      if (isConflict(error)) {
        await refreshAfterConflict();
        return;
      }
      Toast.show({ content: t('center.sortSaveFailed'), icon: 'fail' });
    }
  };

  const handleRemove = async (ledger: LedgerListItem) => {
    if (ledger.status === LedgerStatus.SUSPENDED) {
      Toast.show({ content: t('center.suspended') });
      return;
    }
    if (isMutating)
      return;

    const isOwner = ledger.myRole === LedgerRole.OWNER;
    const actionLabel = t(isOwner ? 'center.archive' : 'center.leave');
    const confirmed = await Dialog.confirm({
      cancelText: t('common:nav.cancel'),
      confirmText: actionLabel,
      content: isOwner
        ? t('center.archiveDescription')
        : t('center.leaveDescription'),
      title: t('center.removeTitle', { action: actionLabel, name: ledger.name }),
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
      Toast.show({
        content: t(isOwner ? 'center.archiveSuccess' : 'center.leaveSuccess', { name: ledger.name }),
        icon: 'success',
      });
    }
    catch (error) {
      if (isConflict(error)) {
        await refreshAfterConflict();
        return;
      }
      Toast.show({
        content: t(isOwner ? 'center.archiveFailed' : 'center.leaveFailed'),
        icon: 'fail',
      });
    }
  };

  const renderContent = () => {
    if (managementQuery.isLoading) {
      return (
        <div className="ledger-center-state" data-testid="ledger-center-loading">
          <SpinLoading />
          <span>{t('center.loading')}</span>
        </div>
      );
    }

    if (managementQuery.isError) {
      return (
        <div className="ledger-center-state">
          <IllustratedEmptyState
            description={t('center.loadErrorDescription')}
            icon={<CircleAlert className="text-primary-deep" size={38} />}
            title={t('center.loadError')}
          />
          <Button
            color="primary"
            data-testid="ledger-center-retry"
            onClick={() => void managementQuery.refetch()}
          >
            {t('center.retry')}
          </Button>
        </div>
      );
    }

    if (!customLedgers.length) {
      return (
        <div className="ledger-center-empty">
          <IllustratedEmptyState
            description={t('center.customEmptyDescription')}
            icon={<BookOpen className="text-primary-deep" size={38} />}
            title={t('center.customEmpty')}
          />
          <div className="ledger-center-empty__actions">
            <Button
              color="primary"
              data-testid="ledger-empty-create"
              onClick={() => navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath())}
            >
              {t('center.create')}
            </Button>
            <Button
              data-testid="ledger-empty-join"
              onClick={() => navigate(ROUTES_PATH.LEDGER_JOIN.getPath())}
            >
              {t('center.join')}
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
            {t('center.suspended')}
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
    <div className="page-new ledger-center-page relative">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={handleBack}
        right={(
          <button
            aria-label={t('center.quickSettings')}
            className="ledger-center-navbar__settings flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
            onClick={() => navigate(ROUTES_PATH.LEDGER_PREFERENCES.getPath())}
            type="button"
          >
            <Settings2 aria-hidden="true" size={18} />
          </button>
        )}
        subtitle={t('center.subtitle')}
        title={t('center.title')}
      />
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
