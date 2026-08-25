import type { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sign } from '@/entities/auth';
import { userKeys } from '@/entities/user';
import { AuthPageShell, AuthPrimaryButton, useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { FormField } from '@/shared/ui';

const Sign: FC = () => {
  const { t } = useTranslation('auth');
  const [form, setForm] = useState({ email: '', password: '', emailCode: '' });
  const queryClient = useQueryClient();
  const { startSession } = useAuthStore(({ startSession }) => ({ startSession }));
  const navigate = useNavigate();

  const handleSign = async () => {
    const { statusCode, data } = await sign(form);
    if (statusCode === 200) {
      startSession(data.token, data.userInfo.userId || String(data.userInfo.id));
      queryClient.setQueryData(userKeys.info(), {
        statusCode: 200,
        message: '',
        data: data.userInfo,
      });
      setTimeout(navigate, 1000, '/');
    }
  };

  return (
    <AuthPageShell
      footer={(
        <span>
          {t('sign.hasAccount')}
          {' '}
          <button className="border-0 bg-transparent p-0 font-bold text-primary-deep" onClick={() => navigate('/login')} type="button">
            {t('sign.gotoLogin')}
          </button>
        </span>
      )}
      kicker={t('brandKicker')}
      onBack={() => navigate(-1)}
      subtitle={t('sign.subtitle')}
      title={t('sign.title')}
    >
      <div className="space-y-4">
        <FormField
          autoComplete="email"
          inputMode="email"
          label={t('sign.email')}
          onChange={email => setForm(current => ({ ...current, email }))}
          placeholder={t('validation.emailRequired')}
          prefix={<Mail size={18} strokeWidth={1.8} />}
          type="email"
          value={form.email}
        />
        <FormField
          autoComplete="new-password"
          label={t('sign.password')}
          onChange={password => setForm(current => ({ ...current, password }))}
          placeholder={t('validation.passwordRequired')}
          prefix={<LockKeyhole size={18} strokeWidth={1.8} />}
          type="password"
          value={form.password}
        />
        <EmailCaptchaInput
          email={form.email}
          onChange={emailCode => setForm(current => ({ ...current, emailCode }))}
          value={form.emailCode}
        />
      </div>
      <p className="mt-3 text-[11px] leading-4 text-ww-soft">{t('sign.passwordRule')}</p>
      <AuthPrimaryButton onClick={() => void handleSign()} testId="sign-submit">
        {t('sign.submit')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default Sign;
