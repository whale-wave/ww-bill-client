import { ErrorBlock, SpinLoading, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FamilyRecordPolicy,
  HouseholdStatus,
  useFamilyRecordPolicyQuery,
  useMyHouseholdQuery,
} from '@/entities/household';
import { LedgerCapability, LedgerKind } from '@/entities/ledger';
import { RecordDetailPresentation, useDeleteLedgerRecordMutation, useLedgerRecordQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { NavBar } from '@/shared/ui';

function FamilyPolicyEntry({ recordId, recordTime }: { recordId: number; recordTime: string }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const householdQuery = useMyHouseholdQuery();
  const household = householdQuery.data;
  const householdId = household?.id ?? '';
  const isActive = household?.status === HouseholdStatus.ACTIVE;
  const isInSharedRange = Boolean(
    household?.sharedStartMonth
    && !dayjs(recordTime).isBefore(dayjs(household.sharedStartMonth), 'day'),
  );
  const policyQuery = useFamilyRecordPolicyQuery({
    params: { householdId, recordId },
    queryOptions: { enabled: Boolean(householdId) && isActive && isInSharedRange },
  });

  if (!isActive || !isInSharedRange)
    return null;

  const policy = policyQuery.data?.effectivePolicy ?? FamilyRecordPolicy.SHARED_COUNTED;
  return (
    <button
      className="flex w-full items-center justify-between border-0 border-b border-solid border-[#ebebeb] bg-white px-[15px] py-[20px] text-left text-base font-normal text-[#aeaeae]"
      data-testid="ledger-record-family-policy"
      onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, recordId))}
      type="button"
    >
      <span>{t('records.familyPolicy')}</span>
      <span className="ml-3 text-base font-normal text-[#605f60]">{t(`records.familyPolicyStates.${policy}`)}</span>
    </button>
  );
}

function DetailContent({ ledgerId, canDelete, canUpdate, showFamilyPolicy }: { ledgerId: string; canDelete: boolean; canUpdate: boolean; showFamilyPolicy: boolean }) {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { recordId = '' } = useParams<{ recordId: string }>();
  const query = useLedgerRecordQuery({ params: { ledgerId, recordId }, queryOptions: { enabled: Boolean(recordId) } });
  const [deleteRecord, deleteState] = useDeleteLedgerRecordMutation();
  const deletingRef = useRef(false);
  if (query.isLoading)
    return <SpinLoading />;
  if (!query.data)
    return <ErrorBlock title={t('records.notFound')} />;
  const record = query.data;
  const date = new Date(record.time);
  const timeDate = getTimeDateYear(date);
  const weekByDay = getWeekByDay(getTimedate(date));
  const handleDelete = async () => {
    if (deletingRef.current)
      return;
    deletingRef.current = true;
    try {
      await deleteRecord({ ledgerId, recordId, version: record.version });
      navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId), { replace: true });
    }
    catch (error) {
      await query.refetch();
      const conflict = typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
      Toast.show({ icon: 'fail', content: t(conflict ? 'records.conflict' : 'records.deleteFailed') });
    }
    finally {
      deletingRef.current = false;
    }
  };

  return (
    <RecordDetailPresentation
      backLabel={t('common:nav.back')}
      category={record.category}
      footerActions={[
        ...(canUpdate
          ? [{
              label: t('records.edit'),
              onClick: () => navigate(ROUTES_PATH.LEDGER_RECORD_EDIT.getPath(ledgerId, record.id)),
            }]
          : []),
        ...(canDelete
          ? [{
              disabled: deleteState.isLoading,
              label: deleteState.isLoading ? t('common.loading') : t('records.delete'),
              onClick: () => void handleDelete(),
              testId: 'ledger-record-delete',
            }]
          : []),
      ]}
      onBack={() => navigate(-1)}
      rows={[
        { label: t('record:edit.type'), value: t(`records.type.${record.type}`) },
        { label: t('records.amount'), value: record.amount },
        { label: t('records.date'), value: `${timeDate}  ${weekByDay}` },
        { label: t('records.remark'), value: record.remark },
      ]}
      showNavigation={false}
      supplementaryContent={showFamilyPolicy
        ? <FamilyPolicyEntry recordId={record.id} recordTime={record.time} />
        : undefined}
    />
  );
}

export default function LedgerRecordDetailPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page">
      <NavBar back={t('common:nav.back')} backArrow={false} onBack={() => navigate(-1)} />
      <div className="min-h-0 flex-grow overflow-hidden">
        <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>{({ ledger, ledgerId }) => <DetailContent canDelete={ledger.capabilities.includes(LedgerCapability.RECORD_DELETE)} canUpdate={ledger.capabilities.includes(LedgerCapability.RECORD_UPDATE)} ledgerId={ledgerId} showFamilyPolicy={ledger.kind === LedgerKind.SYSTEM_DEFAULT} />}</LedgerScopeBoundary>
      </div>
    </div>
  );
}
