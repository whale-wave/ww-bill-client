import { Mail, ShieldCheck } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getUserEmailChangeEmailCaptchaApi,
  getUserEmailChangeEmailCaptchaVerifyApi,
} from '@/entities/user-email';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { FormField, GradientPanel, PageHeader } from '@/shared/ui';

interface EmailChangeProps {}

const EmailChangeCaptcha: React.FC<EmailChangeProps> = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email') || '';
  const [captcha, setCaptcha] = useState<string>('');

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onSendCaptcha = useCallback(async () => {
    return getUserEmailChangeEmailCaptchaApi({ loading: false });
  }, []);

  const onCaptchaVerify = useCallback(async () => {
    const getUserEmailChangeEmailCaptchaVerifyRes
      = await getUserEmailChangeEmailCaptchaVerifyApi({ captcha });
    if (getUserEmailChangeEmailCaptchaVerifyRes.statusCode === 200) {
      navigate(`/settings/email/change?email=${email}&captcha=${captcha}`, {
        replace: true,
      });
    }
  }, [captcha, email, navigate]);

  if (!email) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('emailChange.back')} onBack={onBack} title={t('emailChange.verifyEmail')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-8">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-5 flex items-center gap-3 px-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary-light/60 text-primary-deep"><ShieldCheck size={21} /></span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('emailChange.currentStepTitle')}</h2>
              <p className="mt-0.5 text-[11px] text-ww-mid">{t('emailChange.currentStepHint')}</p>
            </div>
          </div>
          <GradientPanel className="space-y-4 px-5 py-5" elevation="high" surface="glass">
            <FormField disabled label={t('info.email')} prefix={<Mail size={18} />} value={email} />
            <EmailCaptchaInput
              email={email}
              placeholder={t('emailChange.enterCaptcha')}
              value={captcha}
              onChange={setCaptcha}
              onSend={onSendCaptcha}
            />
            <button className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45" disabled={!captcha.trim()} onClick={() => void onCaptchaVerify()} type="button">{t('emailChange.captcha.verify')}</button>
          </GradientPanel>
        </div>
      </main>
    </div>
  );
};

export default EmailChangeCaptcha;
