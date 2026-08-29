import type { ClaimedShortcutDraft, ShortcutDraft } from '@/entities/shortcut-bookkeeping';
import type { RecordDraft } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { CheckCircle2, CircleAlert, ReceiptText, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability, LedgerRecordType, useLedgerNavigationQuery } from '@/entities/ledger';
import {
  useClaimShortcutDraftMutation,
  useConfirmShortcutDraftMutation,
  useDiscardShortcutDraftMutation,
} from '@/entities/shortcut-bookkeeping';
import {
  invalidateLedgerRecordEditorCaches,
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  AppButton,
  confirmAppAction,
  GradientPanel,
  PageHeader,
  PageLoadingState,
} from '@/shared/ui';
import { createShortcutRecordSeed } from './model';

function isTerminalShortcutDraftError(error: unknown, includeNotFound = false) {
  if (!error || typeof error !== 'object' || !('statusCode' in error))
    return false;
  const statusCode = Number(error.statusCode);
  return statusCode === 409
    || statusCode === 410
    || (includeNotFound && statusCode === 404);
}

function readHandoffCode(key: string) {
  try {
    return sessionStorage.getItem(key) ?? '';
  }
  catch {
    return '';
  }
}

function storeHandoffCode(key: string, code: string) {
  try {
    sessionStorage.setItem(key, code);
  }
  catch {
    // The page can still complete without refresh recovery when storage is blocked.
  }
}

function removeHandoffCode(key: string) {
  try {
    sessionStorage.removeItem(key);
  }
  catch {
    // Storage may be unavailable in a restricted browser context.
  }
}

function ShortcutDraftEditor({
  code,
  draft,
  ledgerId,
  onBack,
  onTerminal,
  recordType,
}: {
  code: string;
  draft: ShortcutDraft;
  ledgerId: string;
  onBack: () => void;
  onTerminal: () => void;
  recordType: LedgerRecordType;
}) {
  const { t } = useTranslation(['settings', 'record', 'common']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirmMutation = useConfirmShortcutDraftMutation();
  const seed = useMemo(
    () => createShortcutRecordSeed(draft, recordType),
    [draft, recordType],
  );
  const handleSubmit = useCallback(async (record: RecordDraft) => {
    try {
      const result = await confirmMutation.mutateAsync({
        amount: record.amount,
        categoryId: record.categoryId,
        code,
        draftId: draft.id,
        ledgerId,
        remark: record.remark,
        time: record.time,
        type: record.type,
      });
      await invalidateLedgerRecordEditorCaches(queryClient, ledgerId);
      Toast.show({ content: t('settings:shortcutBookkeeping.saved'), icon: 'success' });
      onTerminal();
      navigate(
        ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(result.ledgerId, result.recordId),
        { replace: true },
      );
    }
    catch (error) {
      if (isTerminalShortcutDraftError(error))
        onTerminal();
      Toast.show({ content: t('settings:shortcutBookkeeping.saveRecordFailed'), icon: 'fail' });
    }
  }, [code, confirmMutation, draft.id, ledgerId, navigate, onTerminal, queryClient, t]);
  const controller = useRecordEditorController({
    isEditing: false,
    onSubmit: handleSubmit,
    onValidationError: (error) => {
      if (error === 'category')
        Toast.show({ content: t('record:bookkeeping.chooseCategory') });
    },
    seed,
    supportsTags: false,
  });
  const categoryQuery = useLedgerCategoriesQuery({
    params: { ledgerId, type: controller.recordType },
  });

  return (
    <RecordEditorPresentation
      categories={categoryQuery.data}
      categoryState={categoryQuery.isLoading
        ? 'loading'
        : categoryQuery.isError ? 'error' : 'ready'}
      controller={{
        ...controller,
        isSubmitting: controller.isSubmitting || confirmMutation.isLoading,
      }}
      onCancel={onBack}
      onRetryCategories={() => void categoryQuery.refetch()}
    />
  );
}

function DraftPreview({
  draft,
  onDiscard,
  onContinue,
  recordType,
  selectedLedgerId,
  setRecordType,
  setSelectedLedgerId,
}: {
  draft: ShortcutDraft;
  onDiscard: () => void;
  onContinue: () => void;
  recordType?: LedgerRecordType;
  selectedLedgerId?: string;
  setRecordType: (recordType: LedgerRecordType) => void;
  setSelectedLedgerId: (ledgerId: string) => void;
}) {
  const { t } = useTranslation('settings');
  const ledgerQuery = useLedgerNavigationQuery();
  const ledgers = ledgerQuery.data.filter(ledger =>
    ledger.capabilities.includes(LedgerCapability.RECORD_CREATE),
  );

  return (
    <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[560px] space-y-5">
        <GradientPanel className="flex items-start gap-3.5 px-4 py-4" elevation="low" surface="ice">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/70 text-primary-deep shadow-ww-xs">
            <ReceiptText size={22} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[14px] font-extrabold text-ww-ink">{t('shortcutBookkeeping.draftTitle')}</h2>
            <p className="mt-1 text-[11px] leading-5 text-ww-mid">{t('shortcutBookkeeping.draftDescription')}</p>
          </div>
        </GradientPanel>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-border-primary bg-white/[0.88] px-4 py-3 shadow-ww-xs">
            <p className="text-[10px] font-bold text-ww-soft">{t('shortcutBookkeeping.candidateAmount')}</p>
            <p className="mt-1 truncate font-number text-[20px] font-black text-ww-ink">
              {draft.amountCandidate ? `¥${draft.amountCandidate}` : t('shortcutBookkeeping.unknown')}
            </p>
          </div>
          <div className="rounded-[18px] border border-border-primary bg-white/[0.88] px-4 py-3 shadow-ww-xs">
            <p className="text-[10px] font-bold text-ww-soft">{t('shortcutBookkeeping.candidateMerchant')}</p>
            <p className="mt-1 truncate text-[14px] font-extrabold leading-7 text-ww-ink">
              {draft.merchantCandidate || t('shortcutBookkeeping.unknown')}
            </p>
          </div>
        </section>

        {draft.warnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-[16px] bg-[#fff6e6] px-3 py-3 text-[11px] leading-5 text-[#8a6836]">
            <CircleAlert className="mt-0.5 shrink-0" size={17} strokeWidth={1.8} />
            <span>{t('shortcutBookkeeping.draftDescription')}</span>
          </div>
        )}

        <section>
          <h2 className="mb-2 px-1 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">{t('shortcutBookkeeping.chooseType')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('shortcutBookkeeping.expense'), type: LedgerRecordType.EXPENSE },
              { label: t('shortcutBookkeeping.income'), type: LedgerRecordType.INCOME },
            ].map(item => (
              <button
                aria-pressed={recordType === item.type}
                className={cn(
                  'h-12 rounded-[16px] border text-[13px] font-extrabold shadow-ww-xs transition',
                  recordType === item.type
                    ? 'border-primary bg-primary-light/55 text-primary-deep'
                    : 'border-border-primary bg-white/[0.88] text-ww-mid',
                )}
                key={item.type}
                onClick={() => setRecordType(item.type)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">{t('shortcutBookkeeping.chooseLedger')}</h2>
          <div className="space-y-2">
            {ledgerQuery.isLoading && <PageLoadingState compact label={t('common:nav.loading')} />}
            {ledgerQuery.isError && (
              <div className="rounded-[18px] border border-border-primary bg-white/85 px-4 py-4 text-center">
                <p className="text-[12px] text-ww-soft">{t('common:error.loadFail')}</p>
                <button className="mt-2 border-0 bg-transparent text-[11px] font-extrabold text-primary-deep" onClick={() => void ledgerQuery.refetch()} type="button">{t('common:retry')}</button>
              </div>
            )}
            {!ledgerQuery.isLoading && !ledgerQuery.isError && ledgers.length === 0 && (
              <p className="rounded-[18px] border border-border-primary bg-white/85 px-4 py-5 text-center text-[12px] text-ww-soft">{t('shortcutBookkeeping.noWritableLedger')}</p>
            )}
            {ledgers.map(ledger => (
              <button
                aria-pressed={selectedLedgerId === ledger.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left shadow-ww-xs transition active:scale-[.99]',
                  selectedLedgerId === ledger.id
                    ? 'border-primary bg-primary-light/55'
                    : 'border-border-primary bg-white/[0.88]',
                )}
                key={ledger.id}
                onClick={() => setSelectedLedgerId(ledger.id)}
                type="button"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-white text-primary-deep shadow-ww-xs">
                  <WalletCards size={18} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-grow truncate text-[13px] font-extrabold text-ww-ink">{ledger.name}</span>
                {selectedLedgerId === ledger.id && <CheckCircle2 className="shrink-0 text-primary-deep" size={20} />}
              </button>
            ))}
          </div>
        </section>

        <details className="rounded-[18px] border border-border-primary bg-white/[0.82] px-4 py-3 shadow-ww-xs">
          <summary className="cursor-pointer text-[12px] font-extrabold text-ww-mid">{t('shortcutBookkeeping.rawText')}</summary>
          <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-[11px] leading-5 text-ww-mid">{draft.rawText}</pre>
        </details>

        <AppButton disabled={!selectedLedgerId || !recordType} fullWidth onClick={onContinue}>
          {t('shortcutBookkeeping.continueReview')}
        </AppButton>
        <AppButton fullWidth onClick={onDiscard} variant="ghost">
          {t('shortcutBookkeeping.discard')}
        </AppButton>
      </div>
    </main>
  );
}

export default function ShortcutBookkeepingConfirmPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') ?? '';
  const urlHandoffCode = searchParams.get('code') ?? '';
  const handoffStorageKey = `ww-shortcut-handoff:${draftId}`;
  const [handoffCode] = useState(() => {
    if (!draftId)
      return '';
    if (urlHandoffCode) {
      storeHandoffCode(handoffStorageKey, urlHandoffCode);
      return urlHandoffCode;
    }
    return readHandoffCode(handoffStorageKey);
  });
  const isLinkValid = Boolean(draftId && handoffCode);
  const claimMutation = useClaimShortcutDraftMutation();
  const discardMutation = useDiscardShortcutDraftMutation();
  const [claimedDraft, setClaimedDraft] = useState<ClaimedShortcutDraft>();
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>();
  const [recordType, setRecordType] = useState<LedgerRecordType>();
  const [isEditing, setIsEditing] = useState(false);
  const [claimAttempt, setClaimAttempt] = useState(0);
  const claimStartedRef = useRef(false);

  const handleClearHandoff = useCallback(() => {
    removeHandoffCode(handoffStorageKey);
  }, [handoffStorageKey]);

  useEffect(() => {
    if (!isLinkValid || claimStartedRef.current)
      return;
    claimStartedRef.current = true;
    void claimMutation.mutateAsync({ code: handoffCode, draftId })
      .then((claimed) => {
        setClaimedDraft(claimed);
        navigate({
          pathname: ROUTES_PATH.SHORTCUT_BOOKKEEPING_CONFIRM.getPath(),
          search: `?draftId=${encodeURIComponent(draftId)}`,
        }, { replace: true });
      })
      .catch((error) => {
        if (isTerminalShortcutDraftError(error, true))
          handleClearHandoff();
      });
  }, [claimAttempt, claimMutation, draftId, handleClearHandoff, handoffCode, isLinkValid, navigate]);

  const handleRetryClaim = useCallback(() => {
    claimMutation.reset();
    claimStartedRef.current = false;
    setClaimAttempt(attempt => attempt + 1);
  }, [claimMutation]);

  const handleDiscard = useCallback(async () => {
    if (!claimedDraft)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('shortcutBookkeeping.discard'),
      description: t('shortcutBookkeeping.discardDescription'),
      title: t('shortcutBookkeeping.discardTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await discardMutation.mutateAsync({
        code: claimedDraft.reviewCode,
        draftId: claimedDraft.id,
      });
      handleClearHandoff();
      navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
    }
    catch (error) {
      if (isTerminalShortcutDraftError(error, true))
        handleClearHandoff();
      Toast.show({ content: t('shortcutBookkeeping.saveFailed'), icon: 'fail' });
    }
  }, [claimedDraft, discardMutation, handleClearHandoff, navigate, t]);

  if (isLinkValid && !claimedDraft && !claimMutation.isError) {
    return <PageLoadingState label={t('common:nav.loading')} testId="shortcut-draft-loading" />;
  }

  if (isEditing && claimedDraft && selectedLedgerId && recordType) {
    return (
      <ShortcutDraftEditor
        code={claimedDraft.reviewCode}
        draft={claimedDraft}
        ledgerId={selectedLedgerId}
        onBack={() => setIsEditing(false)}
        onTerminal={handleClearHandoff}
        recordType={recordType}
      />
    );
  }

  const errorMessage = !isLinkValid && !claimedDraft
    ? t('shortcutBookkeeping.invalidLink')
    : claimMutation.isError || !claimedDraft
      ? t('shortcutBookkeeping.loadFailed')
      : undefined;

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => claimedDraft
          ? void handleDiscard()
          : navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true })}
        title={t('shortcutBookkeeping.title')}
      />
      {errorMessage
        ? (
            <main className="flex min-h-0 flex-grow items-center justify-center px-[18px] pb-12">
              <div className="w-full max-w-[420px] rounded-[20px] border border-border-primary bg-white/[0.88] px-5 py-8 text-center shadow-ww">
                <CircleAlert className="mx-auto text-[#b24f71]" size={36} strokeWidth={1.6} />
                <p className="mt-3 text-[13px] font-bold leading-6 text-ww-mid">{errorMessage}</p>
                {claimMutation.isError && isLinkValid && (
                  <AppButton className="mt-5" fullWidth onClick={handleRetryClaim}>
                    {t('common:retry')}
                  </AppButton>
                )}
                <AppButton className={claimMutation.isError && isLinkValid ? 'mt-3' : 'mt-5'} fullWidth onClick={() => navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true })} variant="secondary">
                  {t('common:nav.back')}
                </AppButton>
              </div>
            </main>
          )
        : claimedDraft && (
          <DraftPreview
            draft={claimedDraft}
            onDiscard={() => void handleDiscard()}
            onContinue={() => setIsEditing(true)}
            recordType={recordType}
            selectedLedgerId={selectedLedgerId}
            setRecordType={setRecordType}
            setSelectedLedgerId={setSelectedLedgerId}
          />
        )}
    </div>
  );
}
