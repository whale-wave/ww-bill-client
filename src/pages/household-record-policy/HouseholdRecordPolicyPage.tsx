import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { Button, ErrorBlock, Toast } from 'antd-mobile';
import { Check, Eye, EyeOff, ShieldCheck, UsersRound } from 'lucide-react';
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
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

const POLICY_OPTIONS = Object.values(FamilyRecordPolicy);
const POLICY_ICONS = {
  [FamilyRecordPolicy.INHERIT]: ShieldCheck,
  [FamilyRecordPolicy.PRIVATE]: EyeOff,
  [FamilyRecordPolicy.SHARED_COUNTED]: UsersRound,
  [FamilyRecordPolicy.SHARED_UNCOUNTED]: Eye,
} as const;

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
      await save({
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
      navigate(-1);
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
      <GradientPanel className="px-5 py-5" elevation="standard" surface="aurora">
        <div className="flex items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-white/72 text-primary-deep shadow-ww-xs">
            <ShieldCheck size={23} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-[16px] font-black leading-6 text-ww-ink">{t('policy.heading')}</h1>
            <p className="mt-1 text-[11px] font-semibold leading-[18px] text-ww-mid">{t('policy.description')}</p>
          </div>
        </div>
      </GradientPanel>
      <div className="mt-5 space-y-3" role="radiogroup">
        {POLICY_OPTIONS.map((option) => {
          const PolicyIcon = POLICY_ICONS[option];
          const isSelected = policy === option;
          return (
            <label
              className={`flex cursor-pointer items-center gap-3.5 rounded-[20px] border border-solid px-4 py-4 shadow-ww-xs transition active:scale-[0.99] ${isSelected ? 'border-primary/60 bg-primary-light/55' : 'border-border-primary bg-white/[0.84]'}`}
              key={option}
            >
              <input checked={isSelected} className="sr-only" name="policy" onChange={() => setSelectedPolicy(option)} type="radio" value={option} />
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${isSelected ? 'bg-white text-primary-deep shadow-ww-xs' : 'bg-[#eef6f9] text-ww-mid'}`}>
                <PolicyIcon size={20} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[13px] font-black leading-5 text-ww-ink">{t(`policy.${option}`)}</strong>
                <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-ww-soft">{t(`policy.${option}Description`)}</span>
              </span>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solid ${isSelected ? 'border-primary bg-primary text-white' : 'border-[#cbdbe2] bg-white/70 text-transparent'}`}>
                <Check size={14} strokeWidth={3} />
              </span>
            </label>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-[18px] mt-6 border-t border-solid border-white/70 bg-white/75 px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <Button
          block
          className="h-[52px] border-0 bg-[linear-gradient(135deg,#50bfd8,#14afc5)] text-[14px] font-black text-white shadow-[0_8px_18px_rgba(20,175,197,0.25)]"
          data-testid="household-policy-save"
          loading={mutation.isLoading}
          onClick={() => void handleSave()}
          size="large"
        >
          {t('policy.save')}
        </Button>
      </div>
    </HouseholdPageState>
  );
};

const HouseholdRecordPolicyPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '', recordId = '' } = useParams<{ householdId: string; recordId: string }>();
  const parsedRecordId = Number(recordId);
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-16 h-56 w-56 rounded-full bg-primary-light/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-12 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} subtitle={t('settings.subtitle')} title={t('policy.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-0 pt-2">
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
