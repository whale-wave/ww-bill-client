import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateHouseholdMutation } from '@/entities/household';
import { formatMonthStart, getApiErrorMessage, HouseholdPageHeader } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `household-${Date.now()}`;
}

const HouseholdCreatePage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => formatMonthStart(new Date()).slice(0, 7));
  const [consent, setConsent] = useState(false);
  const [createHousehold, mutation] = useCreateHouseholdMutation();
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!consent) {
      void Toast.show({ content: t('create.consentRequired') });
      return;
    }
    if (submittingRef.current)
      return;

    submittingRef.current = true;
    try {
      const response = await createHousehold({
        idempotencyKey: idempotencyKeyRef.current,
        sharedStartMonth: `${month}-01`,
        sharingConsentConfirmed: true,
      });
      void Toast.show({ content: t('create.success'), icon: 'success' });
      navigate(ROUTES_PATH.HOUSEHOLD_INVITATION.getPath(response.data.household.id), {
        replace: true,
      });
    }
    catch (error) {
      void Toast.show({
        content: getApiErrorMessage(error, t('create.failed')),
        icon: 'fail',
      });
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="page-new household-shell overflow-hidden">
      <HouseholdPageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('common.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto px-4 py-12">
        <form className="household-form-card" onSubmit={handleSubmit}>
          <h2>{t('create.heading')}</h2>
          <p>{t('create.description')}</p>
          <label className="mt-9 block text-center">
            <span className="mb-4 block text-sm text-[#9b9ca1]">{t('create.month')}</span>
            <input
              className="h-[72px] w-full border-0 rounded-lg bg-[#f6f6f8] px-4 text-center text-[28px] font-medium text-[#292a2e] outline-none"
              onChange={event => setMonth(event.target.value)}
              required
              type="month"
              value={month}
            />
          </label>
          <Button
            block
            className="household-primary-button mt-12"
            disabled={mutation.isLoading}
            loading={mutation.isLoading}
            type="submit"
          >
            {t('create.submit')}
          </Button>
          <label className="household-consent">
            <input
              checked={consent}
              onChange={event => setConsent(event.target.checked)}
              type="checkbox"
            />
            <span>{t('create.consent')}</span>
          </label>
        </form>
      </main>
    </div>
  );
};

export default HouseholdCreatePage;
