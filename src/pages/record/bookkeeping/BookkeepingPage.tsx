import type { RecordDraft, RecordEditorReturnContext } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCategoryQuery } from '@/entities/category';
import { LedgerCapability, LedgerKind, useGetLedgersQuery } from '@/entities/ledger';
import { useCreateLedgerTagMutation, useLedgerTagsQuery } from '@/entities/ledger-data';
import {
  usePostRecordMutation,
  usePutRecordMutation,
  useUploadTemporaryRecordAttachmentMutation,
} from '@/entities/record';
import {
  invalidatePersonalRecordEditorCaches,
  isLegacyRecordEditorState,
  isRecordEditorLocationState,
  omitRecordEditorTagManagementState,
  readRecordEditorTagManagementState,
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { hapticFeedback } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';

function getValidSelectTime(value: string | null) {
  if (!value)
    return;
  const parsed = Number(value);
  return Number.isFinite(parsed) && dayjs(parsed).isValid() ? parsed : undefined;
}

function BookkeepingPage() {
  const { t } = useTranslation('record');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [postRecord, postState] = usePostRecordMutation();
  const [putRecord, putState] = usePutRecordMutation();
  const [uploadImage] = useUploadTemporaryRecordAttachmentMutation();
  const [createTag] = useCreateLedgerTagMutation();
  const ledgersQuery = useGetLedgersQuery();
  const defaultLedger = ledgersQuery.data.find(ledger => ledger.kind === LedgerKind.SYSTEM_DEFAULT);
  const canReadTags = Boolean(defaultLedger?.capabilities.includes(LedgerCapability.TAG_READ));
  const selectTime = getValidSelectTime(searchParams.get('selectTime'));
  const editorState = isRecordEditorLocationState(location.state)
    ? location.state.recordEditor
    : undefined;
  const initialRecord = editorState?.initialRecord
    ?? (isLegacyRecordEditorState(location.state) ? location.state : undefined);
  const tagManagementState = readRecordEditorTagManagementState(location.state);
  const restoredDraft = tagManagementState?.recordEditorTagManagement?.draft;
  const returnContext = useMemo<RecordEditorReturnContext>(() => {
    if (editorState)
      return editorState.returnContext;
    if (selectTime)
      return { kind: 'personal-calendar', selectTime };
    if (initialRecord)
      return { kind: 'personal-detail', recordId: initialRecord.id };
    return { kind: 'history' };
  }, [editorState, initialRecord, selectTime]);
  const seed = useMemo(() => restoredDraft ?? ({
    amount: initialRecord?.amount,
    category: initialRecord?.category
      ? { ...initialRecord.category, type: initialRecord.type }
      : undefined,
    recordType: initialRecord?.type ?? 'sub' as const,
    remark: initialRecord?.remark,
    tagIds: initialRecord?.tags?.map(tag => tag.id),
    attachment: initialRecord?.attachments?.[0],
    hasImage: Boolean(initialRecord?.attachments?.length),
    time: initialRecord?.time
      ?? (selectTime ? dayjs(selectTime).toISOString() : dayjs().toISOString()),
  }), [initialRecord, restoredDraft, selectTime]);

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
            ? { ...initialRecord, ...draft, status: true }
            : undefined,
        });
        return;
      default:
        navigate(-1);
    }
  }, [initialRecord, navigate]);

  const handleSubmit = useCallback(async (draft: RecordDraft) => {
    try {
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
      hapticFeedback.success();
      Toast.show({ content: response.message, icon: 'success' });
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
    initialRecord,
    navigateToReturnContext,
    postRecord,
    putRecord,
    queryClient,
    returnContext,
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
    isEditing: Boolean(initialRecord),
    onUploadImage: async file => (await uploadImage({ file, ledgerId: defaultLedger?.id })).data.assetId,
  });
  const categoryQuery = useGetCategoryQuery({
    params: { type: controller.recordType },
  });
  const tagsQuery = useLedgerTagsQuery({
    params: { ledgerId: defaultLedger?.id ?? '', categoryId: controller.selectedCategory?.id },
    queryOptions: { enabled: Boolean(defaultLedger && canReadTags) },
  });

  const handleCancel = useCallback(() => {
    playSound.turnPage();
    navigateToReturnContext(returnContext);
  }, [navigateToReturnContext, returnContext]);
  const handleManageTags = useCallback(() => {
    if (!defaultLedger)
      return;
    navigate(ROUTES_PATH.LEDGER_TAGS.getPath(defaultLedger.id), {
      replace: true,
      state: {
        recordEditorTagManagement: {
          draft: controller.getDraftSnapshot(),
          returnMode: 'replace',
          returnTo: { pathname: location.pathname, search: location.search, state: omitRecordEditorTagManagementState(location.state) },
        },
      },
    });
  }, [controller, defaultLedger, location.pathname, location.search, location.state, navigate]);

  return (
    <RecordEditorPresentation
      categories={categoryQuery.data}
      categoryState={categoryQuery.isLoading
        ? 'loading'
        : categoryQuery.isError ? 'error' : 'ready'}
      controller={{
        ...controller,
        isSubmitting: controller.isSubmitting || postState.isLoading || putState.isLoading,
      }}
      onCancel={handleCancel}
      onManageTags={canReadTags && defaultLedger?.capabilities.includes(LedgerCapability.TAG_MANAGE) ? handleManageTags : undefined}
      onRetryCategories={() => void categoryQuery.refetch()}
      canManageTags={Boolean(defaultLedger?.capabilities.includes(LedgerCapability.TAG_MANAGE))}
      onCreateTag={defaultLedger && controller.selectedCategory
        ? async name => (await createTag({ data: { categoryId: controller.selectedCategory!.id, name }, ledgerId: defaultLedger.id })).data
        : undefined}
      tags={canReadTags && controller.selectedCategory ? tagsQuery.data : undefined}
    />
  );
}

export default BookkeepingPage;
