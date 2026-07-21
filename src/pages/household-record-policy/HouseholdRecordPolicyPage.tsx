import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { Button, ErrorBlock, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FamilyRecordPolicy,
  useFamilyRecordPolicyQuery,
  useSetFamilyRecordPolicyMutation,
} from '@/entities/household';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const POLICY_OPTIONS = Object.values(FamilyRecordPolicy);

const PolicyContent: FC<{ household: Household; recordId: number }> = ({ household, recordId }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const policyQuery = useFamilyRecordPolicyQuery({
    params: { householdId: household.id, recordId },
    queryOptions: { enabled: Boolean(recordId) },
  });
  const [selectedPolicy, setSelectedPolicy] = useState<FamilyRecordPolicy>();
  const policy = selectedPolicy ?? policyQuery.data?.policy ?? FamilyRecordPolicy.INHERIT;
  const [save, mutation] = useSetFamilyRecordPolicyMutation();
  const submittingRef = useRef(false);

  const handleSave = async () => {
    if (submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      const response = await save({
        data: {
          policy,
          ...(policyQuery.data?.version !== undefined
            ? { version: policyQuery.data.version }
            : {}),
        },
        householdId: household.id,
        recordId,
      });
      void Toast.show({ content: t('policy.saved'), icon: 'success' });
      if (policy === FamilyRecordPolicy.PRIVATE) {
        navigate(response.data.ledgerId
          ? ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath(response.data.ledgerId, recordId)
          : ROUTES_PATH.LEDGERS.getPath(), { replace: true });
      }
      else {
        navigate(-1);
      }
    }
    catch (error) {
      if (getApiErrorStatus(error) === 409) {
        await policyQuery.refetch();
        void Toast.show({ content: t('common.conflict'), icon: 'fail' });
      }
      else {
        void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
      }
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <HouseholdPageState
      errorDescription={t('common.loadErrorDescription')}
      errorTitle={t('common.loadError')}
      isError={policyQuery.isError}
      isLoading={policyQuery.isLoading}
      loadingLabel={t('common.loading')}
      onRetry={() => void policyQuery.refetch()}
      retryLabel={t('common.retry')}
    >
      <section className="card-rounded bg-white px-4 py-5">
        <h1 className="text-lg font-medium text-font-black">{t('policy.heading')}</h1>
        <p className="mt-2 text-sm leading-6 text-font-gray">{t('policy.description')}</p>
        <div className="mt-5 overflow-hidden rounded-xl border border-solid border-[#EBEBEB]">
          {POLICY_OPTIONS.map((option, index) => (
            <label className={`flex items-start gap-3 px-3 py-4 ${index ? 'border-0 border-t border-solid border-[#EBEBEB]' : ''}`} key={option}>
              <input checked={policy === option} className="mt-1 accent-[var(--adm-color-primary)]" name="policy" onChange={() => setSelectedPolicy(option)} type="radio" value={option} />
              <span>
                <strong className="block text-sm text-font-black">{t(`policy.${option}`)}</strong>
                <span className="mt-1 block text-xs leading-5 text-font-gray">{t(`policy.${option}Description`)}</span>
              </span>
            </label>
          ))}
        </div>
        <Button
          block
          className="mt-6"
          color="primary"
          data-testid="household-policy-save"
          loading={mutation.isLoading}
          onClick={() => void handleSave()}
          size="large"
        >
          {t('policy.save')}
        </Button>
      </section>
    </HouseholdPageState>
  );
};

const HouseholdRecordPolicyPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '', recordId = '' } = useParams<{ householdId: string; recordId: string }>();
  const parsedRecordId = Number(recordId);
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('policy.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        {!Number.isInteger(parsedRecordId) || parsedRecordId <= 0
          ? <ErrorBlock status="default" title={t('common.invalidContext')} />
          : (
              <HouseholdScopeBoundary householdId={householdId}>
                {household => <PolicyContent household={household} recordId={parsedRecordId} />}
              </HouseholdScopeBoundary>
            )}
      </main>
    </div>
  );
};

export default HouseholdRecordPolicyPage;
