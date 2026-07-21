import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

function normalizeInviteCode(value: string) {
  return value.toUpperCase().replace(/\s+/g, '');
}

const HouseholdJoinPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const normalized = normalizeInviteCode(String(form.get('code') ?? code));
    if (normalized.length < 4) {
      void Toast.show({ content: t('join.invalidCode') });
      return;
    }
    navigate(ROUTES_PATH.HOUSEHOLD_INVITATION_PREVIEW.getPath(normalized));
  };

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('join.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <form className="card-rounded bg-white px-4 py-5" onSubmit={handleSubmit}>
          <label className="block text-sm text-font-black">
            <span className="mb-2 block">{t('join.code')}</span>
            <input
              autoCapitalize="characters"
              autoComplete="off"
              className="h-14 w-full rounded-xl border-0 bg-bg-gray px-4 text-center text-xl tracking-[0.16em] text-font-black outline-none"
              maxLength={32}
              name="code"
              onChange={event => setCode(event.target.value)}
              placeholder={t('join.codePlaceholder')}
              value={code}
            />
          </label>
          <p className="mt-4 text-sm leading-6 text-font-gray">{t('join.help')}</p>
          <Button block className="mt-8" color="primary" size="large" type="submit">
            {t('join.preview')}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default HouseholdJoinPage;
