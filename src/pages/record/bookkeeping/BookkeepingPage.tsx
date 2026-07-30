import type { RecordDraft, RecordEditorReturnContext } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCategoryQuery } from '@/entities/category';
import {
  usePostRecordMutation,
  usePutRecordMutation,
} from '@/entities/record';
import {
  invalidatePersonalRecordEditorCaches,
  isLegacyRecordEditorState,
  isRecordEditorLocationState,
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
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
  const selectTime = getValidSelectTime(searchParams.get('selectTime'));
  const editorState = isRecordEditorLocationState(location.state)
    ? location.state.recordEditor
    : undefined;
  const initialRecord = editorState?.initialRecord
    ?? (isLegacyRecordEditorState(location.state) ? location.state : undefined);
  const returnContext = useMemo<RecordEditorReturnContext>(() => {
    if (editorState)
      return editorState.returnContext;
    if (selectTime)
      return { kind: 'personal-calendar', selectTime };
    if (initialRecord)
      return { kind: 'personal-detail', recordId: initialRecord.id };
    return { kind: 'history' };
  }, [editorState, initialRecord, selectTime]);
  const seed = useMemo(() => ({
    amount: initialRecord?.amount,
    category: initialRecord?.category
      ? { ...initialRecord.category, type: initialRecord.type }
      : undefined,
    recordType: initialRecord?.type ?? 'sub' as const,
    remark: initialRecord?.remark,
    time: initialRecord?.time
      ?? (selectTime ? dayjs(selectTime).toISOString() : dayjs().toISOString()),
  }), [initialRecord, selectTime]);

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
      const response = initialRecord
        ? await putRecord({
            data: { ...draft, version: initialRecord.version },
            id: String(initialRecord.id),
          })
        : await postRecord(draft);
      if (response.statusCode !== 200)
        throw response;
      await invalidatePersonalRecordEditorCaches(queryClient);
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
  });
  const categoryQuery = useGetCategoryQuery({
    params: { type: controller.recordType },
  });

  const handleCancel = useCallback(() => {
    playSound.turnPage();
    navigateToReturnContext(returnContext);
  }, [navigateToReturnContext, returnContext]);

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
      onRetryCategories={() => void categoryQuery.refetch()}
    />
  );
}

export default BookkeepingPage;
