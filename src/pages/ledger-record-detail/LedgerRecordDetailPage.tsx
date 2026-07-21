import { Button, ErrorBlock, NavBar, SpinLoading, Toast } from 'antd-mobile';
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
import { useDeleteLedgerRecordMutation, useLedgerRecordQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

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
      className="mt-4 flex min-h-[56px] w-full items-center justify-between rounded-xl border border-solid border-[#EBEBEB] bg-white px-3 text-left"
      data-testid="ledger-record-family-policy"
      onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, recordId))}
      type="button"
    >
      <span>
        <strong className="block text-sm font-medium">{t('records.familyPolicy')}</strong>
        <span className="mt-1 block text-xs text-font-gray">{t('records.familyPolicyHint')}</span>
      </span>
      <span className="text-sm text-font-gray">{t(`records.familyPolicyStates.${policy}`)}</span>
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
  return (
    <section className="bg-white px-4 py-4">
      <h1 className="text-lg font-medium">{record.remark}</h1>
      <p className="mt-2 text-font-gray">{record.category.name}</p>
      <p className="my-4 text-3xl">
        {record.type === 'sub' ? '-' : '+'}
        {record.amount}
      </p>
      <div className="flex gap-2">
        {canUpdate && <Button onClick={() => navigate(ROUTES_PATH.LEDGER_RECORD_EDIT.getPath(ledgerId, record.id))}>{t('records.edit')}</Button>}
        {canDelete && (
          <Button
            color="danger"
            data-testid="ledger-record-delete"
            loading={deleteState.isLoading}
            onClick={async () => {
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
            }}
          >
            {t('records.delete')}
          </Button>
        )}
      </div>
      {showFamilyPolicy && <FamilyPolicyEntry recordId={record.id} recordTime={record.time} />}
    </section>
  );
}

export default function LedgerRecordDetailPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('records.detail')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.RECORD_READ}>{({ ledger, ledgerId }) => <DetailContent canDelete={ledger.capabilities.includes(LedgerCapability.RECORD_DELETE)} canUpdate={ledger.capabilities.includes(LedgerCapability.RECORD_UPDATE)} ledgerId={ledgerId} showFamilyPolicy={ledger.kind === LedgerKind.SYSTEM_DEFAULT} />}</LedgerScopeBoundary>
    </div>
  );
}
