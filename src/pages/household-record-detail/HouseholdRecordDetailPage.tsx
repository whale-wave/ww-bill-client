import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import { Toast } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdRecordQuery } from '@/entities/household';
import { RecordDetailPresentation } from '@/entities/record';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return value;
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

const RecordDetail: FC<{
  householdId: string;
  record: FamilyRecord;
}> = ({ householdId, record }) => {
  const { t } = useTranslation(['household', 'record', 'common']);
  const navigate = useNavigate();
  const userQuery = useGetUserUserInfoQuery();
  const isOwner = userQuery.data?.id === record.creator.id;
  const amountSign = record.type === 'sub' ? '-' : '+';
  const tags = record.tags.map(tag => `#${tag.name}`).join(' ');
  const date = new Date(record.time);
  const timeDate = getTimeDateYear(date);
  const weekByDay = getWeekByDay(getTimedate(date));

  const handleShare = async () => {
    const text = t('recordDetail.shareText', {
      amount: `${amountSign}${record.amount}`,
      category: record.category?.name ?? t('recordDetail.uncategorized'),
      date: formatDateTime(record.time),
      remark: record.remark,
    });
    try {
      if (navigator.share)
        await navigator.share({ text, title: t('recordDetail.title') });
      else
        await navigator.clipboard?.writeText(text);
      void Toast.show({ content: t('recordDetail.shared'), icon: 'success' });
    }
    catch {
      // Cancelling the native share sheet should not turn into a page error.
    }
  };

  return (
    <RecordDetailPresentation
      backLabel={t('common:nav.back')}
      category={{
        icon: record.category?.icon ?? 'default',
        name: record.category?.name ?? t('recordDetail.uncategorized'),
      }}
      footerActions={[
        { label: t('recordDetail.share'), onClick: () => void handleShare() },
        ...(isOwner
          ? [{
              label: t('recordDetail.policy'),
              onClick: () => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, record.id)),
              testId: 'household-record-policy',
            }]
          : []),
      ]}
      onBack={() => navigate(-1)}
      rows={[
        { label: t('recordDetail.type'), value: record.type === 'sub' ? t('recordDetail.expense') : t('recordDetail.income') },
        { label: t('record:edit.amount'), value: record.amount },
        { label: t('recordDetail.date'), value: `${timeDate}  ${weekByDay}` },
        { label: t('recordDetail.remark'), value: record.remark || t('recordDetail.none') },
      ]}
      supplementaryRows={[
        { label: t('recordDetail.member'), value: record.creator.name || record.creator.username || `#${record.creator.id}` },
        ...(tags ? [{ label: t('recordDetail.tags'), value: tags }] : []),
        { label: t('recordDetail.counted'), value: record.counted ? t('recordDetail.counted') : t('recordDetail.uncounted') },
        { label: t('recordDetail.policy'), value: t(`policy.${record.effectivePolicy}`) },
      ]}
    />
  );
};

const HouseholdRecordDetailPage: FC = () => {
  const { t } = useTranslation('household');
  const params = useParams<{ householdId: string; recordId: string }>();
  const householdId = params.householdId ?? '';
  const recordId = Number(params.recordId);
  const validParams = Boolean(householdId) && Number.isInteger(recordId) && recordId > 0;
  const recordQuery = useHouseholdRecordQuery({
    params: { householdId, recordId },
    queryOptions: { enabled: validParams },
  });

  return (
    <HouseholdScopeBoundary householdId={householdId}>
      {() => (
        <HouseholdPageState
          errorDescription={validParams ? t('common.loadErrorDescription') : t('recordDetail.invalid')}
          errorTitle={validParams ? t('common.loadError') : t('recordDetail.notFound')}
          isError={!validParams || recordQuery.isError || (!recordQuery.isLoading && !recordQuery.data)}
          isLoading={recordQuery.isLoading}
          loadingLabel={t('common.loading')}
          onRetry={validParams ? () => void recordQuery.refetch() : undefined}
          retryLabel={t('common.retry')}
        >
          {recordQuery.data && <RecordDetail householdId={householdId} record={recordQuery.data} />}
        </HouseholdPageState>
      )}
    </HouseholdScopeBoundary>
  );
};

export default HouseholdRecordDetailPage;
