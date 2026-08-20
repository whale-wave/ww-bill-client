import type { Ledger } from '@/entities/ledger';
import type { RecordEntry } from '@/entities/record';
import type { RecordDraft } from '@/features/record-editor';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ErrorBlock,
  Toast,
} from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { useLedgerTagsQuery } from '@/entities/ledger-data';
import {
  createLedgerRecordDetailState,
  readLedgerRecordDetailState,
  useLedgerRecordQuery,
  useUpdateLedgerRecordMutation,
} from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import {
  invalidateLedgerRecordEditorCaches,
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { PageLoadingState } from '@/shared/ui';

interface LedgerRecordEditEditorProps {
  initialRecord: RecordEntry;
  ledgerId: string;
  recordId: string;
  supportsTags: boolean;
  tags: Array<{ id: string; name: string }>;
}

function LedgerRecordEditEditor({
  initialRecord,
  ledgerId,
  recordId,
  supportsTags,
  tags,
}: LedgerRecordEditEditorProps) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updateRecord, updateState] = useUpdateLedgerRecordMutation();
  const seed = useMemo(() => ({
    amount: initialRecord.amount,
    category: { ...initialRecord.category, type: initialRecord.type },
    recordType: initialRecord.type,
    remark: initialRecord.remark,
    tagIds: supportsTags ? initialRecord.tags?.map(tag => tag.id) ?? [] : undefined,
    time: initialRecord.time,
  }), [initialRecord, supportsTags]);
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
  });
  const categoryQuery = useLedgerCategoriesQuery({
    params: { ledgerId, type: controller.recordType },
  });
  const navigateToDetail = useCallback(() => {
    navigate(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(ledgerId, recordId), {
      replace: true,
      state: createLedgerRecordDetailState(initialRecord, ledgerId),
    });
  }, [initialRecord, ledgerId, navigate, recordId]);

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
      onCancel={navigateToDetail}
      onRetryCategories={() => void categoryQuery.refetch()}
      tags={tags}
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
  const tagsQuery = useLedgerTagsQuery({
    params: { ledgerId },
    queryOptions: { enabled: canReadTags },
  });
  const initialRecord = recordQuery.data
    ?? readLedgerRecordDetailState(location.state, ledgerId, recordId);

  if (recordQuery.isLoading && !initialRecord) {
    return <PageLoadingState label={t('common:nav.loading')} testId="record-edit-loading" />;
  }
  if (!initialRecord) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-4">
        <ErrorBlock
          description={t('common.loadErrorDescription')}
          title={t('common.loadError')}
        />
        <Button className="mt-3" onClick={() => void recordQuery.refetch()} size="small">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const supportsTags = canReadTags && !tagsQuery.isError;
  return (
    <LedgerRecordEditEditor
      initialRecord={initialRecord}
      ledgerId={ledgerId}
      recordId={recordId}
      supportsTags={supportsTags}
      tags={supportsTags ? tagsQuery.data : []}
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
