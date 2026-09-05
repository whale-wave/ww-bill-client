import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import type { RecordEntry } from '@/entities/record';
import type { RecordEditorLocationState } from '@/features/record-editor';
import { Toast } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { useHouseholdRecordQuery } from '@/entities/household';
import { RecordDetailPresentation, useDeleteRecordMutation } from '@/entities/record';
import { RecordAttachmentSection } from '@/entities/record/ui/RecordAttachmentSection';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { getDisplayName, HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { confirmDangerousAction, PageHeader } from '@/shared/ui';

const RecordDetail: FC<{
  householdId: string;
  record: FamilyRecord;
}> = ({ householdId, record }) => {
  const { t } = useTranslation(['household', 'record', 'common']);
  const navigate = useNavigate();
  const userQuery = useGetUserUserInfoQuery();
  const isOwner = userQuery.data?.id === record.creator.id;
  const tags = record.tags.map(tag => `#${tag.name}`).join(' ');
  const date = new Date(record.time);
  const timeDate = getTimeDateYear(date);
  const weekByDay = getWeekByDay(getTimedate(date));
  const [deleteRecord, deleteState] = useDeleteRecordMutation();
  const editableRecord: RecordEntry | undefined = record.category
    ? {
        amount: record.amount,
        category: {
          createdAt: record.time,
          icon: record.category.icon,
          id: record.category.id,
          name: record.category.name,
          updatedAt: record.time,
        },
        createdAt: record.time,
        id: record.id,
        remark: record.remark,
        attachments: record.attachments,
        tags: record.tags,
        time: record.time,
        type: record.type,
        updatedAt: record.time,
        version: record.version,
      }
    : undefined;

  const handleDelete = async () => {
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('record:detail.delete'),
      description: t('record:detail.deleteWarning'),
      title: t('common:confirm.delete'),
    });
    if (!confirmed)
      return;

    try {
      const response = await deleteRecord({ id: String(record.id), version: record.version });
      void Toast.show({ content: response.message, icon: 'success' });
      navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(householdId), { replace: true });
    }
    catch {
      void Toast.show({ content: t('common:api.requestFailed'), icon: 'fail' });
    }
  };

  return (
    <RecordDetailPresentation
      amount={record.amount}
      amountType={record.type}
      backLabel={t('common:nav.back')}
      category={{
        icon: record.category?.icon ?? 'bill',
        name: record.category?.name ?? t('recordDetail.uncategorized'),
      }}
      categoryIcon={<CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} size={36} />}
      memberColorKey={record.creator.colorKey}
      footerActions={isOwner
        ? [
            {
              disabled: !editableRecord,
              label: t('record:detail.edit'),
              onClick: () => {
                if (editableRecord) {
                  const state: RecordEditorLocationState = {
                    recordEditor: {
                      initialRecord: editableRecord,
                      returnContext: {
                        householdId,
                        kind: 'household-detail',
                        recordId: record.id,
                      },
                    },
                  };
                  navigate(ROUTES_PATH.BOOKKEEPING.getPath(), {
                    replace: true,
                    state,
                  });
                }
              },
            },
            {
              disabled: deleteState.isLoading,
              label: t('record:detail.delete'),
              onClick: () => void handleDelete(),
              tone: 'danger',
            },
          ]
        : []}
      onBack={() => navigate(-1)}
      rows={[
        { label: t('recordDetail.type'), value: record.type === 'sub' ? t('recordDetail.expense') : t('recordDetail.income') },
        { copyValue: `${timeDate}  ${weekByDay}`, label: t('recordDetail.date'), value: `${timeDate}  ${weekByDay}` },
        { ...(record.remark ? { copyValue: record.remark } : {}), label: t('recordDetail.remark'), value: record.remark || t('recordDetail.none') },
      ]}
      supplementaryRows={[
        { label: t('recordDetail.member'), value: getDisplayName(record.creator) },
        ...(tags ? [{ copyValue: tags, label: t('recordDetail.tags'), value: tags }] : []),
        { label: t('recordDetail.counted'), value: record.counted ? t('recordDetail.counted') : t('recordDetail.uncounted') },
        {
          label: t('recordDetail.policy'),
          ...(isOwner
            ? {
                onClick: () => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, record.id)),
                testId: 'household-record-policy',
              }
            : {}),
          value: t(`policy.${record.effectivePolicy}`),
        },
      ]}
      supplementaryContent={record.attachments?.length
        ? <RecordAttachmentSection attachments={record.attachments} householdId={householdId} />
        : undefined}
    />
  );
};

const HouseholdRecordDetailPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const params = useParams<{ householdId: string; recordId: string }>();
  const householdId = params.householdId ?? '';
  const recordId = Number(params.recordId);
  const validParams = Boolean(householdId) && Number.isInteger(recordId) && recordId > 0;
  const recordQuery = useHouseholdRecordQuery({
    params: { householdId, recordId },
    queryOptions: { enabled: validParams },
  });

  return (
    <div className="page-new relative overflow-hidden">
      {!recordQuery.data && (
        <PageHeader
          backLabel={t('common:nav.back')}
          onBack={() => navigate(-1)}
          title={t('recordDetail.title')}
        />
      )}
      <div className="min-h-0 flex-grow overflow-hidden">
        <HouseholdScopeBoundary householdId={householdId}>
          {() => (
            <HouseholdPageState
              errorDescription={validParams ? t('common.loadErrorDescription') : t('recordDetail.invalid')}
              errorTitle={validParams ? t('common.loadError') : t('recordDetail.notFound')}
              isError={!validParams || recordQuery.isError || (!recordQuery.isLoading && !recordQuery.data)}
              isLoading={validParams && recordQuery.isLoading}
              loadingLabel={t('common.loading')}
              onRetry={validParams ? () => void recordQuery.refetch() : undefined}
              retryLabel={t('common.retry')}
            >
              {recordQuery.data && <RecordDetail householdId={householdId} record={recordQuery.data} />}
            </HouseholdPageState>
          )}
        </HouseholdScopeBoundary>
      </div>
    </div>
  );
};

export default HouseholdRecordDetailPage;
