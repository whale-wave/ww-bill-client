import type { ClaimedShortcutDraft } from '@/entities/shortcut-bookkeeping';
import type { RecordDraft, RecordEditorReturnContext } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { readAgentRecordEditorState, useConfirmAgentActionMutation } from '@/entities/agent';
import { invalidateAssetQueries, useGetAssetGroupQuery, useGetAssetQuery } from '@/entities/asset';
import { useGetCategoryQuery } from '@/entities/category';
import { LedgerCapability, LedgerKind, useGetLedgersQuery } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery } from '@/entities/ledger-data';
import {
  createPersonalRecordDetailNavigationState,
  readPersonalRecordDetailNavigationState,
  usePostRecordMutation,
  usePutRecordMutation,
  useRecordRemarkHistoryQuery,
  useUploadTemporaryRecordAttachmentMutation,
} from '@/entities/record';
import {
  useConfirmShortcutDraftMutation,
  useDiscardShortcutDraftMutation,
} from '@/entities/shortcut-bookkeeping';
import {
  createShortcutRecordSeed,
  inferShortcutCategory,
  inferShortcutRecordType,
  invalidatePersonalRecordEditorCaches,
  isLegacyRecordEditorState,
  isRecordEditorLocationState,
  readRecordEditorSettingsNavigationLocationState,
  RecordEditorPresentation,
  useRecordEditorController,
  useRecordEditorSettingsNavigation,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { hapticFeedback } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';
import { useMotionPreference } from '@/shared/ui';

function getValidSelectTime(value: string | null) {
  if (!value) {
    return;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && dayjs(parsed).isValid() ? parsed : undefined;
}

interface ShortcutBookkeepingLocationState {
  shortcutBookkeeping: ClaimedShortcutDraft;
}

function readShortcutBookkeepingState(value: unknown): ShortcutBookkeepingLocationState | undefined {
  if (typeof value !== 'object' || value === null || !('shortcutBookkeeping' in value))
    return undefined;
  const draft = value.shortcutBookkeeping;
  if (typeof draft !== 'object' || draft === null)
    return undefined;
  if (!('id' in draft) || typeof draft.id !== 'string'
    || !('rawText' in draft) || typeof draft.rawText !== 'string'
    || !('reviewCode' in draft) || typeof draft.reviewCode !== 'string') {
    return undefined;
  }
  return value as ShortcutBookkeepingLocationState;
}

function BookkeepingPage() {
  const { t } = useTranslation('record');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [postRecord, postState] = usePostRecordMutation();
  const [putRecord, putState] = usePutRecordMutation();
  const [isSaveSucceeded, setIsSaveSucceeded] = useState(false);
  const confirmShortcutDraftMutation = useConfirmShortcutDraftMutation();
  const confirmAgentActionMutation = useConfirmAgentActionMutation();
  const discardShortcutDraftMutation = useDiscardShortcutDraftMutation();
  const [uploadImage] = useUploadTemporaryRecordAttachmentMutation();
  const [createTag] = useCreateLedgerTagMutation();
  const [archiveTag] = useArchiveLedgerTagMutation();
  const ledgersQuery = useGetLedgersQuery();
  const defaultLedger = ledgersQuery.data.find(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT);
  const canReadTags = Boolean(defaultLedger?.capabilities.includes(LedgerCapability.TAG_READ));
  const selectTime = getValidSelectTime(searchParams.get('selectTime'));
  const editorState = isRecordEditorLocationState(location.state)
    ? location.state.recordEditor
    : undefined;
  const initialRecord = editorState?.initialRecord
    ?? (isLegacyRecordEditorState(location.state) ? location.state : undefined);
  const settingsNavigationState = readRecordEditorSettingsNavigationLocationState(location.state);
  const restoredDraft = settingsNavigationState?.recordEditorSettingsNavigation?.draft;
  const shortcutBookkeeping = readShortcutBookkeepingState(location.state)?.shortcutBookkeeping;
  const agentRecordDraft = readAgentRecordEditorState(location.state)?.agentRecordDraft;
  const personalRecordDetailNavigation = readPersonalRecordDetailNavigationState(location.state);
  const { isMotionEnabled } = useMotionPreference();
  const shortcutRecordType = shortcutBookkeeping
    ? inferShortcutRecordType(shortcutBookkeeping)
    : undefined;
  const returnContext = useMemo<RecordEditorReturnContext>(() => {
    if (editorState)
      return editorState.returnContext;
    if (selectTime)
      return { kind: 'personal-calendar', selectTime };
    if (initialRecord)
      return { kind: 'personal-detail', recordId: initialRecord.id };
    return { kind: 'history' };
  }, [editorState, initialRecord, selectTime]);
  const isPersonalAssetLinkContext = returnContext.kind === 'history'
    || returnContext.kind === 'personal-calendar'
    || returnContext.kind === 'personal-detail';
  const supportsAssetLink = isPersonalAssetLinkContext && !shortcutBookkeeping && !agentRecordDraft;
  const assetQuery = useGetAssetQuery({ queryOptions: { enabled: supportsAssetLink } });
  const assetGroupQuery = useGetAssetGroupQuery({ queryOptions: { enabled: supportsAssetLink } });
  const seed = useMemo(() => restoredDraft ?? (agentRecordDraft
    ? {
        amount: agentRecordDraft.record.amount,
        category: agentRecordDraft.category,
        recordType: agentRecordDraft.record.type,
        remark: agentRecordDraft.record.remark,
        tagIds: agentRecordDraft.record.tagIds,
        time: agentRecordDraft.record.time,
      }
    : shortcutBookkeeping && shortcutRecordType
      ? createShortcutRecordSeed(shortcutBookkeeping, shortcutRecordType)
      : {
          amount: initialRecord?.amount,
          category: initialRecord?.category
            ? { ...initialRecord.category, type: initialRecord.type }
            : undefined,
          recordType: initialRecord?.type ?? 'sub' as const,
          remark: initialRecord?.remark,
          tagIds: initialRecord?.tags?.map(tag => tag.id),
          attachment: initialRecord?.attachments?.[0],
          hasImage: Boolean(initialRecord?.attachments?.length),
          linkedAssetId: initialRecord?.linkedAsset?.id ?? null,
          location: initialRecord?.location,
          time: initialRecord?.time
            ?? (selectTime ? dayjs(selectTime).toISOString() : dayjs().toISOString()),
        }), [agentRecordDraft, initialRecord, restoredDraft, selectTime, shortcutBookkeeping, shortcutRecordType]);

  const navigateToReturnContext = useCallback((
    context: RecordEditorReturnContext,
    draft?: RecordDraft,
  ) => {
    switch (context.kind) {
      case 'personal-calendar':
        navigate(`${ROUTES_PATH.RECORD_CALENDAR.getPath()}?selectTime=${context.selectTime}`, { replace: true });
        return;
      case 'household-calendar':
        navigate(`${ROUTES_PATH.HOUSEHOLD_CALENDAR.getPath(context.householdId)}?selectTime=${context.selectTime}`, { replace: true });
        return;
      case 'household-detail':
        navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(context.householdId, context.recordId), { replace: true });
        return;
      case 'personal-detail':
        navigate(`/editing/${context.recordId}`, {
          replace: true,
          state: initialRecord && draft
            ? {
                ...initialRecord,
                ...draft,
                status: true,
                ...personalRecordDetailNavigation,
              }
            : undefined,
        });
        return;
      default:
        navigate(-1);
    }
  }, [initialRecord, navigate, personalRecordDetailNavigation]);

  const showSuccessFeedback = useCallback(async () => {
    setIsSaveSucceeded(true);
    if (!isMotionEnabled)
      return;
    await new Promise<void>(resolve => window.setTimeout(resolve, 320));
  }, [isMotionEnabled]);

  const handleSubmit = useCallback(async (draft: RecordDraft) => {
    try {
      if (agentRecordDraft) {
        const { imageAssetId: _imageAssetId, ...record } = draft;
        await confirmAgentActionMutation.mutateAsync({
          actionId: agentRecordDraft.actionId,
          record,
        });
        await invalidatePersonalRecordEditorCaches(queryClient);
        hapticFeedback.success();
        Toast.show({ content: t('agent:confirmed'), icon: 'success' });
        await showSuccessFeedback();
        navigate(`${ROUTES_PATH.AGENT.getPath()}?conversationId=${encodeURIComponent(agentRecordDraft.conversationId)}`, { replace: true });
        return;
      }
      if (shortcutBookkeeping) {
        if (!defaultLedger)
          throw new Error('No default ledger available');
        const result = await confirmShortcutDraftMutation.mutateAsync({
          amount: draft.amount,
          categoryId: draft.categoryId,
          code: shortcutBookkeeping.reviewCode,
          draftId: shortcutBookkeeping.id,
          ...(typeof draft.imageAssetId === 'string' ? { imageAssetId: draft.imageAssetId } : {}),
          ledgerId: defaultLedger.id,
          ...(draft.location === undefined ? {} : { location: draft.location }),
          remark: draft.remark,
          tagIds: draft.tagIds,
          time: draft.time,
          type: draft.type,
        });
        await invalidatePersonalRecordEditorCaches(queryClient);
        hapticFeedback.success();
        Toast.show({ content: t('settings:shortcutBookkeeping.saved'), icon: 'success' });
        await showSuccessFeedback();
        navigate(`/editing/${result.recordId}`, {
          replace: true,
          state: createPersonalRecordDetailNavigationState(),
        });
        return;
      }
      const { imageAssetId, ...recordData } = draft;
      const response = initialRecord
        ? await putRecord({
            data: { ...draft, version: initialRecord.version },
            id: String(initialRecord.id),
          })
        : await postRecord(imageAssetId === null ? recordData : { ...recordData, imageAssetId });
      if (response.statusCode !== 200)
        throw response;
      await invalidatePersonalRecordEditorCaches(queryClient);
      await invalidateAssetQueries(queryClient);
      hapticFeedback.success();
      Toast.show({ content: response.message, icon: 'success' });
      await showSuccessFeedback();
      navigateToReturnContext(returnContext, draft);
    }
    catch (error) {
      const isConflict = typeof error === 'object'
        && error !== null
        && 'statusCode' in error
        && error.statusCode === 409;
      Toast.show({
        content: t(isConflict ? 'bookkeeping.conflict' : 'bookkeeping.saveFailed'),
        icon: 'fail',
      });
    }
  }, [
    agentRecordDraft,
    confirmAgentActionMutation,
    confirmShortcutDraftMutation,
    defaultLedger,
    initialRecord,
    navigate,
    navigateToReturnContext,
    postRecord,
    putRecord,
    queryClient,
    returnContext,
    shortcutBookkeeping,
    showSuccessFeedback,
    t,
  ]);

  const controller = useRecordEditorController({
    onSubmit: handleSubmit,
    onValidationError: (error) => {
      if (error === 'category')
        Toast.show({ content: t('bookkeeping.chooseCategory') });
    },
    seed,
    supportsTags: canReadTags,
    supportsAssetLink,
    isEditing: Boolean(initialRecord),
    onUploadImage: async file => (await uploadImage({ file, ledgerId: defaultLedger?.id })).data.assetId,
  });
  const openRecordEditorSettings = useRecordEditorSettingsNavigation(
    controller.getDraftSnapshot,
  );
  const categoryQuery = useGetCategoryQuery({
    params: { type: controller.recordType },
  });
  const inferredShortcutCategory = shortcutBookkeeping && shortcutRecordType === controller.recordType
    ? inferShortcutCategory(categoryQuery.data, shortcutBookkeeping)
    : undefined;
  useEffect(() => {
    controller.applyInitialCategory(inferredShortcutCategory);
  }, [controller, inferredShortcutCategory]);
  const tagsQuery = useLedgerTagsQuery({
    params: { ledgerId: defaultLedger?.id ?? '', categoryId: controller.selectedCategory?.id },
    queryOptions: { enabled: Boolean(defaultLedger && canReadTags) },
  });
  const remarkHistoryQuery = useRecordRemarkHistoryQuery({
    params: { categoryId: controller.selectedCategory?.id },
    queryOptions: { enabled: controller.isNoteFocused && Boolean(controller.selectedCategory) },
  });

  const handleCancel = useCallback(async () => {
    if (agentRecordDraft) {
      playSound.turnPage();
      navigate(`${ROUTES_PATH.AGENT.getPath()}?conversationId=${encodeURIComponent(agentRecordDraft.conversationId)}`, { replace: true });
      return;
    }
    if (shortcutBookkeeping) {
      navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
      void discardShortcutDraftMutation.mutateAsync({
        code: shortcutBookkeeping.reviewCode,
        draftId: shortcutBookkeeping.id,
      }).catch(() => undefined);
      return;
    }
    playSound.turnPage();
    navigateToReturnContext(returnContext);
  }, [agentRecordDraft, discardShortcutDraftMutation, navigate, navigateToReturnContext, returnContext, shortcutBookkeeping]);
  const handleArchiveTag = useCallback(async (tagId: string) => {
    const tag = tagsQuery.data.find(item => item.id === tagId);
    if (defaultLedger && tag)
      await archiveTag({ ledgerId: defaultLedger.id, tagId, version: tag.version });
  }, [archiveTag, defaultLedger, tagsQuery.data]);

  return (
    <RecordEditorPresentation
      assetAccounts={supportsAssetLink ? assetQuery.data : undefined}
      assetGroups={supportsAssetLink ? assetGroupQuery.data : undefined}
      categories={categoryQuery.data}
      categoryState={categoryQuery.isLoading
        ? 'loading'
        : categoryQuery.isError ? 'error' : 'ready'}
      controller={{
        ...controller,
        isSubmitting: controller.isSubmitting || postState.isLoading || putState.isLoading || confirmShortcutDraftMutation.isLoading || confirmAgentActionMutation.isLoading,
      }}
      initialStage={shortcutBookkeeping || agentRecordDraft ? 'amount' : undefined}
      isSaveSucceeded={isSaveSucceeded}
      onArchiveTag={defaultLedger?.capabilities.includes(LedgerCapability.TAG_MANAGE) ? handleArchiveTag : undefined}
      onCancel={() => void handleCancel()}
      onManageCategories={defaultLedger
        ? () => openRecordEditorSettings(
            ROUTES_PATH.LEDGER_CATEGORIES.getPath(defaultLedger.id),
            { reopenTagPicker: false },
          )
        : undefined}
      onManageTags={canReadTags && defaultLedger?.capabilities.includes(LedgerCapability.TAG_MANAGE)
        ? () => openRecordEditorSettings(ROUTES_PATH.LEDGER_TAGS.getPath(defaultLedger.id))
        : undefined}
      onRetryCategories={() => void categoryQuery.refetch()}
      remarkHistory={remarkHistoryQuery.data}
      canManageTags={Boolean(defaultLedger?.capabilities.includes(LedgerCapability.TAG_MANAGE))}
      onCreateTag={defaultLedger && controller.selectedCategory
        ? async name => (await createTag({ data: { categoryId: controller.selectedCategory!.id, name }, ledgerId: defaultLedger.id })).data
        : undefined}
      tags={canReadTags && controller.selectedCategory ? tagsQuery.data : undefined}
    />
  );
}

export default BookkeepingPage;
