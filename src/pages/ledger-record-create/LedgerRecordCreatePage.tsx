import type { Ledger } from '@/entities/ledger';
import type { RecordDraft } from '@/features/record-editor';
import { SpinLoading, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLedgerCategoriesQuery } from '@/entities/category';
import {
  LedgerCapability,
  LedgerRecordType,
  useLedgerPreferencesQuery,
} from '@/entities/ledger';
import { useLedgerTagsQuery } from '@/entities/ledger-data';
import { useCreateLedgerRecordMutation } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import {
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function getValidSelectTime(value: string | null) {
  if (!value)
    return;
  const parsed = Number(value);
  return Number.isFinite(parsed) && dayjs(parsed).isValid() ? parsed : undefined;
}

interface LedgerRecordCreateEditorProps {
  initialRecordType: LedgerRecordType;
  ledgerId: string;
  supportsTags: boolean;
  tags: Array<{ id: string; name: string }>;
}

function LedgerRecordCreateEditor({
  initialRecordType,
  ledgerId,
  supportsTags,
  tags,
}: LedgerRecordCreateEditorProps) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectTime = getValidSelectTime(searchParams.get('selectTime'));
  const [createRecord, createState] = useCreateLedgerRecordMutation();
  const seed = useMemo(() => ({
    recordType: initialRecordType,
    tagIds: supportsTags ? [] : undefined,
    time: selectTime ? dayjs(selectTime).toISOString() : dayjs().toISOString(),
  }), [initialRecordType, selectTime, supportsTags]);
  const navigateAfterCreate = useCallback(() => {
    const target = selectTime
      ? `${ROUTES_PATH.LEDGER_CALENDAR.getPath(ledgerId)}?selectTime=${selectTime}`
      : ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId);
    navigate(target, { replace: true });
  }, [ledgerId, navigate, selectTime]);
  const handleSubmit = useCallback(async (draft: RecordDraft) => {
    try {
      const response = await createRecord({ data: draft, ledgerId });
      Toast.show({ content: response.message || t('records.saved'), icon: 'success' });
      navigateAfterCreate();
    }
    catch {
      Toast.show({ content: t('records.saveFailed'), icon: 'fail' });
    }
  }, [createRecord, ledgerId, navigateAfterCreate, t]);
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

  return (
    <RecordEditorPresentation
      categories={categoryQuery.data}
      categoryState={categoryQuery.isLoading
        ? 'loading'
        : categoryQuery.isError ? 'error' : 'ready'}
      controller={{
        ...controller,
        isSubmitting: controller.isSubmitting || createState.isLoading,
      }}
      onCancel={navigateAfterCreate}
      onRetryCategories={() => void categoryQuery.refetch()}
      tags={tags}
    />
  );
}

function LedgerRecordCreateContent({
  ledger,
  ledgerId,
}: {
  ledger: Ledger;
  ledgerId: string;
}) {
  const preferenceQuery = useLedgerPreferencesQuery({ params: { ledgerId } });
  const canReadTags = ledger.capabilities.includes(LedgerCapability.TAG_READ);
  const tagsQuery = useLedgerTagsQuery({
    params: { ledgerId },
    queryOptions: { enabled: canReadTags },
  });

  if (preferenceQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <SpinLoading />
      </div>
    );
  }

  const supportsTags = canReadTags && !tagsQuery.isError;
  return (
    <LedgerRecordCreateEditor
      initialRecordType={preferenceQuery.data?.defaultRecordType ?? LedgerRecordType.EXPENSE}
      ledgerId={ledgerId}
      supportsTags={supportsTags}
      tags={supportsTags ? tagsQuery.data : []}
    />
  );
}

export default function LedgerRecordCreatePage() {
  return (
    <LedgerScopeBoundary capability={LedgerCapability.RECORD_CREATE}>
      {scope => <LedgerRecordCreateContent {...scope} />}
    </LedgerScopeBoundary>
  );
}
