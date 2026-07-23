import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import { Button, Toast } from 'antd-mobile';
import { SlidersHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdRecordQuery } from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { RecordDetailHero, RecordDetailRows } from '@/features/record-workspace';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { FixedPin } from '@/shared/ui';

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
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const userQuery = useGetUserUserInfoQuery();
  const isOwner = userQuery.data?.id === record.creator.id;
  const amountSign = record.type === 'sub' ? '-' : '+';
  const tags = record.tags.map(tag => `#${tag.name}`).join(' ');

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
    <>
      <RecordDetailHero
        backLabel={t('common:nav.back')}
        categoryIcon={record.category?.icon}
        categoryName={record.category?.name ?? t('recordDetail.uncategorized')}
        onBack={() => navigate(-1)}
      />
      <RecordDetailRows
        action={<FixedPin onClick={() => void handleShare()}>{t('recordDetail.share')}</FixedPin>}
        rows={[
          { label: t('recordDetail.type'), value: record.type === 'sub' ? t('recordDetail.expense') : t('recordDetail.income') },
          { label: t('recordDetail.amount'), value: `${amountSign}${record.amount}` },
          { label: t('recordDetail.date'), value: formatDateTime(record.time) },
          { label: t('recordDetail.member'), value: record.creator.name || record.creator.username || `#${record.creator.id}` },
          { label: t('recordDetail.remark'), value: record.remark || t('recordDetail.none') },
          ...(tags ? [{ label: t('recordDetail.tags'), value: tags }] : []),
          { label: t('records.policy'), value: record.counted ? t('recordDetail.counted') : t('recordDetail.uncounted') },
        ]}
      />
      <div className="mx-3 mt-4">
        {isOwner && (
          <Button
            block
            color="primary"
            data-testid="household-record-policy"
            onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, record.id))}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={17} />
              {t('recordDetail.policy')}
            </span>
          </Button>
        )}
      </div>
    </>
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <main className="min-h-0 flex-grow overflow-auto bg-white pb-6">
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
      </main>
    </div>
  );
};

export default HouseholdRecordDetailPage;
