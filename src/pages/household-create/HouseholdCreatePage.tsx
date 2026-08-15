import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateHouseholdMutation } from '@/entities/household';
import { useGetRecordBillQuery } from '@/entities/record';
import { formatMonthStart, getApiErrorMessage } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `household-${Date.now()}`;
}

function currentMonth() {
  return formatMonthStart(new Date()).slice(0, 7);
}

const HouseholdCreatePage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [consent, setConsent] = useState(false);
  const [createHousehold, mutation] = useCreateHouseholdMutation();
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(createIdempotencyKey());
  const billQuery = useGetRecordBillQuery({
    params: { type: 'all' },
  });
  const earliestMonth = billQuery.data.earliestMonth ?? null;
  const month = selectedMonth ?? earliestMonth ?? currentMonth();

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
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('create.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <form className="mx-auto w-full max-w-[520px]" onSubmit={handleSubmit}>
          <GradientPanel className="mt-2 px-5 py-5" elevation="low" surface="aurora">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/70 bg-white/85 text-primary-deep shadow-ww-xs">
                <Sparkles size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h1 className="text-[15px] font-extrabold leading-6 text-ww-ink">{t('create.heading')}</h1>
                <p className="mt-0.5 text-[12px] font-semibold leading-5 text-ww-mid">{t('create.description')}</p>
              </div>
            </div>
          </GradientPanel>

          <GradientPanel className="mt-4 px-5 py-5" elevation="low" surface="glass">
            <label className="block min-w-0">
              <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{t('create.month')}</span>
              <span className="flex min-h-[54px] items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
                <CalendarDays className="text-primary-deep" size={20} strokeWidth={1.8} />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 font-number text-[15px] text-ww-ink outline-none"
                  min={earliestMonth ?? undefined}
                  onChange={event => setSelectedMonth(event.target.value)}
                  required
                  type="month"
                  value={month}
                />
              </span>
            </label>
            {earliestMonth && (
              <p className="mt-3 text-[12px] font-semibold leading-5 text-ww-mid">
                {t('create.earliestMonthHelper', { month: earliestMonth })}
              </p>
            )}
            <label className="mt-5 flex items-start gap-3 rounded-[15px] bg-primary-light/25 px-3.5 py-3 text-[12px] font-bold leading-5 text-ww-ink">
              <input
                checked={consent}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                onChange={event => setConsent(event.target.checked)}
                type="checkbox"
              />
              <span>{t('create.consent')}</span>
            </label>
            <Button
              block
              className="mt-6"
              color="primary"
              disabled={mutation.isLoading}
              loading={mutation.isLoading}
              size="large"
              type="submit"
            >
              {t('create.submit')}
            </Button>
          </GradientPanel>
        </form>
      </main>
    </div>
  );
};

export default HouseholdCreatePage;
