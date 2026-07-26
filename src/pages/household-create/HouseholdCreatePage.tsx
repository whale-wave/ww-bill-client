import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateHouseholdMutation } from '@/entities/household';
import { formatMonthStart, getApiErrorMessage } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('create.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <form className="card-rounded bg-white px-4 py-5" onSubmit={handleSubmit}>
          <h1 className="text-lg font-medium text-font-black">{t('create.heading')}</h1>
          <p className="mt-2 text-sm leading-6 text-font-gray">{t('create.description')}</p>
          <label className="mt-6 block text-sm text-font-black">
            <span className="mb-2 block">{t('create.month')}</span>
            <input
              className="h-12 w-full rounded-xl border border-solid border-[#E5E7EB] bg-bg-gray px-3 text-base text-font-black"
              onChange={event => setMonth(event.target.value)}
              required
              type="month"
              value={month}
            />
          </label>
          <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-font-black">
            <input
              checked={consent}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
              onChange={event => setConsent(event.target.checked)}
              type="checkbox"
            />
            <span>{t('create.consent')}</span>
          </label>
          <Button
            block
            className="mt-8"
            color="primary"
            disabled={mutation.isLoading}
            loading={mutation.isLoading}
            size="large"
            type="submit"
          >
            {t('create.submit')}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default HouseholdCreatePage;
