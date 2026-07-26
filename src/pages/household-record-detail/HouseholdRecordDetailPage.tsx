import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import { Button, Toast } from 'antd-mobile';
import { Share2, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdRecordQuery } from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return value;
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

const DetailRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid min-h-[58px] grid-cols-[76px_1fr] items-center border-0 border-b border-solid border-bg-gray px-4 last:border-b-0">
    <span className="text-sm text-font-gray">{label}</span>
    <span className="break-words text-sm text-font-black">{value}</span>
  </div>
);

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
      <section className="bg-primary px-4 pb-5 pt-4 text-center text-font-black">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          {record.category?.icon || '¥'}
        </div>
        <h1 className="mt-2 text-xl font-semibold">
          {record.category?.name ?? t('recordDetail.uncategorized')}
        </h1>
        <p className="mt-2 text-3xl font-semibold tabular-nums">
          {`${amountSign}${record.amount}`}
        </p>
        <p className="mt-1 text-xs opacity-70">
          {record.counted ? t('recordDetail.counted') : t('recordDetail.uncounted')}
        </p>
      </section>

      <section className="mx-3 mt-3 overflow-hidden rounded-xl bg-white">
        <DetailRow label={t('recordDetail.type')} value={record.type === 'sub' ? t('recordDetail.expense') : t('recordDetail.income')} />
        <DetailRow label={t('recordDetail.date')} value={formatDateTime(record.time)} />
        <DetailRow label={t('recordDetail.member')} value={record.creator.name || record.creator.username || `#${record.creator.id}`} />
        <DetailRow label={t('recordDetail.remark')} value={record.remark || t('recordDetail.none')} />
        {tags && <DetailRow label={t('recordDetail.tags')} value={tags} />}
      </section>

      <div className="mx-3 mt-4 grid grid-cols-2 gap-3">
        <Button block onClick={() => void handleShare()}>
          <span className="inline-flex items-center gap-2">
            <Share2 size={17} />
            {t('recordDetail.share')}
          </span>
        </Button>
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('recordDetail.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
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
