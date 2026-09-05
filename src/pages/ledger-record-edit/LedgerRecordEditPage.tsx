import type { Ledger } from '@/entities/ledger';
import type { RecordEntry } from '@/entities/record';
import type { RecordDraft } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { CircleAlert } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery } from '@/entities/ledger-data';
import {
  createLedgerRecordDetailState,
  readLedgerRecordDetailState,
  useLedgerRecordQuery,
  useRecordRemarkHistoryQuery,
  useUpdateLedgerRecordMutation,
  useUploadTemporaryRecordAttachmentMutation,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import {
  invalidateLedgerRecordEditorCaches,
  readRecordEditorSettingsNavigationLocationState,
  RecordEditorPresentation,
  useRecordEditorController,
  useRecordEditorSettingsNavigation,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageLoadingState, Surface } from '@/shared/ui';

interface LedgerRecordEditEditorProps {
  initialRecord: RecordEntry;
  ledgerId: string;
  recordId: string;
  supportsTags: boolean;
  canManageTags: boolean;
}

function LedgerRecordEditEditor({
  initialRecord,
  ledgerId,
  recordId,
  supportsTags,
  canManageTags,
}: LedgerRecordEditEditorProps) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [updateRecord, updateState] = useUpdateLedgerRecordMutation();
  const [uploadImage] = useUploadTemporaryRecordAttachmentMutation();
  const [createTag] = useCreateLedgerTagMutation();
  const [archiveTag] = useArchiveLedgerTagMutation();
  const restoredDraft = readRecordEditorSettingsNavigationLocationState(location.state)?.recordEditorSettingsNavigation?.draft;
  const seed = useMemo(() => restoredDraft ?? ({
    amount: initialRecord.amount,
    category: { ...initialRecord.category, type: initialRecord.type },
    recordType: initialRecord.type,
    remark: initialRecord.remark,
    tagIds: supportsTags ? initialRecord.tags?.map(tag => tag.id) ?? [] : undefined,
    attachment: initialRecord.attachments?.[0],
    hasImage: Boolean(initialRecord.attachments?.length),
    time: initialRecord.time,
  }), [initialRecord, restoredDraft, supportsTags]);
  const handleSubmit = useCallback(async (draft: RecordDraft) => {
    try {
      const response = await updateRecord({
        data: { ...draft, version: initialRecord.version },
        ledgerId,
        recordId,
      });
      await invalidateLedgerRecordEditorCaches(queryClient, ledgerId);
      Toast.show({ content: response.message || t('records.saved'), icon: 'success' });
      navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId), {
        replace: true,
        state: createLedgerRecordDetailState({
          ...initialRecord,
          amount: draft.amount,
          remark: draft.remark,
          time: draft.time,
          type: draft.type,
          version: initialRecord.version + 1,
        }, ledgerId),
      });
    }
    catch (error) {
      const isConflict = typeof error === 'object'
        && error !== null
        && 'statusCode' in error
        && error.statusCode === 409;
      Toast.show({
        content: t(isConflict ? 'records.conflict' : 'records.saveFailed'),
        icon: 'fail',
      });
    }
  }, [initialRecord, ledgerId, navigate, queryClient, recordId, t, updateRecord]);
  const controller = useRecordEditorController({
    onSubmit: handleSubmit,
    onValidationError: (error) => {
      if (error === 'category')
        Toast.show({ content: t('record:bookkeeping.chooseCategory') });
    },
    seed,
    supportsTags,
    isEditing: true,
    onUploadImage: async file => (await uploadImage({ file, ledgerId })).data.assetId,
  });
  const openRecordEditorSettings = useRecordEditorSettingsNavigation(
    controller.getDraftSnapshot,
  );
  const categoryQuery = useLedgerCategoriesQuery({
    params: { ledgerId, type: controller.recordType },
  });
  const navigateToDetail = useCallback(() => {
    navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId), {
      replace: true,
      state: createLedgerRecordDetailState(initialRecord, ledgerId),
    });
  }, [initialRecord, ledgerId, navigate, recordId]);
  const tagsQuery = useLedgerTagsQuery({
    params: { ledgerId, categoryId: controller.selectedCategory?.id },
    queryOptions: { enabled: supportsTags },
  });
  const remarkHistoryQuery = useRecordRemarkHistoryQuery({
    params: { categoryId: controller.selectedCategory?.id, ledgerId },
    queryOptions: { enabled: controller.isNoteFocused && Boolean(controller.selectedCategory) },
  });
  const handleArchiveTag = useCallback(async (tagId: string) => {
    const tag = tagsQuery.data.find(item => item.id === tagId);
    if (tag)
      await archiveTag({ ledgerId, tagId, version: tag.version });
  }, [archiveTag, ledgerId, tagsQuery.data]);

  return (
    <RecordEditorPresentation
      categories={categoryQuery.data}
      categoryState={categoryQuery.isLoading
        ? 'loading'
        : categoryQuery.isError ? 'error' : 'ready'}
      controller={{
        ...controller,
        isSubmitting: controller.isSubmitting || updateState.isLoading,
      }}
      onArchiveTag={canManageTags ? handleArchiveTag : undefined}
      onCancel={navigateToDetail}
      onManageCategories={() => openRecordEditorSettings(
        ROUTES_PATH.LEDGER_CATEGORIES.getPath(ledgerId),
        { reopenTagPicker: false },
      )}
      onManageTags={canManageTags
        ? () => openRecordEditorSettings(ROUTES_PATH.LEDGER_TAGS.getPath(ledgerId))
        : undefined}
      onRetryCategories={() => void categoryQuery.refetch()}
      remarkHistory={remarkHistoryQuery.data}
      canManageTags={canManageTags}
      onCreateTag={controller.selectedCategory ? async name => (await createTag({ data: { categoryId: controller.selectedCategory!.id, name }, ledgerId })).data : undefined}
      tags={supportsTags && controller.selectedCategory ? tagsQuery.data : undefined}
    />
  );
}

function LedgerRecordEditContent({
  ledger,
  ledgerId,
}: {
  ledger: Ledger;
  ledgerId: string;
}) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const { recordId = '' } = useParams<{ recordId: string }>();
  const recordQuery = useLedgerRecordQuery({
    params: { ledgerId, recordId },
    queryOptions: { enabled: Boolean(recordId) },
  });
  const canReadTags = ledger.capabilities.includes(LedgerCapability.TAG_READ);
  const initialRecord = recordQuery.data
    ?? readLedgerRecordDetailState(location.state, ledgerId, recordId);

  if (recordQuery.isLoading && !initialRecord) {
    return <PageLoadingState label={t('common:nav.loading')} testId="record-edit-loading" />;
  }
  if (!initialRecord) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-[var(--ww-page-gutter)]">
        <Surface className="w-full max-w-[520px] overflow-hidden" material="content">
          <IllustratedEmptyState
            actionLabel={t('common.retry')}
            description={t('common.loadErrorDescription')}
            icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
            onAction={() => void recordQuery.refetch()}
            title={t('common.loadError')}
          />
        </Surface>
      </div>
    );
  }

  const supportsTags = canReadTags;
  return (
    <LedgerRecordEditEditor
      initialRecord={initialRecord}
      ledgerId={ledgerId}
      recordId={recordId}
      supportsTags={supportsTags}
      canManageTags={ledger.capabilities.includes(LedgerCapability.TAG_MANAGE)}
    />
  );
}

export default function LedgerRecordEditPage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_UPDATE}>
      {scope => <LedgerRecordEditContent {...scope} />}
    </LedgerScopeBoundary>
  );
}
