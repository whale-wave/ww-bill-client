import type { FC, FormEvent } from 'react';
import { Toast } from 'antd-mobile';
import { TicketCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, IllustratedEmptyState, PageHeader } from '@/shared/ui';

function normalizeInviteCode(value: string) {
  return value.toUpperCase().replace(/\s+/g, '');
}

const HouseholdJoinPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const normalized = normalizeInviteCode(code);
  const isInvalid = touched && normalized.length < 4;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const inputValue = (form.elements.namedItem('code') as HTMLInputElement | null)?.value ?? code;
    const value = normalizeInviteCode(inputValue);
    setTouched(true);
    if (value.length < 4) {
      void Toast.show({ content: t('join.invalidCode') });
      return;
    }
    navigate(ROUTES_PATH.HOUSEHOLD_INVITATION_PREVIEW.getPath(value));
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('join.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <form className="mx-auto w-full max-w-[520px]" onSubmit={handleSubmit}>
          <GradientPanel className="mt-2 px-5 py-6" elevation="low" surface="ice">
            <IllustratedEmptyState
              className="min-h-[210px] py-4"
              description={t('join.help')}
              icon={<TicketCheck className="text-primary-deep" size={38} strokeWidth={1.8} />}
              title={t('join.code')}
            />
            <label className="block min-w-0">
              <span className="flex min-h-[60px] items-center rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
                <input
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-center font-number text-[22px] font-extrabold tracking-[0.18em] text-ww-ink outline-none placeholder:font-number placeholder:text-[14px] placeholder:font-semibold placeholder:tracking-normal placeholder:text-ww-soft"
                  maxLength={32}
                  name="code"
                  onBlur={() => setTouched(true)}
                  onChange={event => setCode(event.target.value)}
                  placeholder={t('join.codePlaceholder')}
                  value={code}
                />
              </span>
            </label>
            {isInvalid && (
              <p className="mt-2 text-center text-[12px] font-bold text-[#c04870]">{t('join.invalidCode')}</p>
            )}
            <button
              className="mt-6 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
              data-testid="household-join-preview"
              disabled={!code.trim()}
              type="submit"
            >
              {t('join.preview')}
            </button>
          </GradientPanel>
        </form>
      </main>
    </div>
  );
};

export default HouseholdJoinPage;
