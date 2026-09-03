import { Toast } from 'antd-mobile';
import { Mail, RefreshCw } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserEmailChangeEmailCaptchaNewEmailApi, usePostUserEmailChangeEmailMutation } from '@/entities/user-email';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { FormField, PageHeader, Surface } from '@/shared/ui';

interface EmailChangeProps {}

const EmailChange: React.FC<EmailChangeProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email') || '';
  const captcha = urlSearchParams.get('captcha') || '';
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCaptcha, setNewCaptcha] = useState<string>('');
  const [postUserEmailChangeEmailMutate]
    = usePostUserEmailChangeEmailMutation();

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onSendNewCaptcha = useCallback(async () => {
    if (!newEmail.trim()) {
      Toast.show({
        content: t('user:emailChange.newEmail.placeholder'),
        position: 'top',
      });
      return false;
    }
    const response = await getUserEmailChangeEmailCaptchaNewEmailApi({
      newEmail,
      captcha,
    }, false);
    switch (response.statusCode) {
      case 4003:
      case 4005:
        setTimeout(() =>
          navigate(`/settings/email/change/captcha?email=${email}`, {
            replace: true,
          }),
        );
        return false;
      case 200:
        return response;
      default:
        return response;
    }
  }, [captcha, email, navigate, newEmail, t]);

  const onSendChangeEmail = useCallback(async () => {
    if (!newEmail.trim()) {
      Toast.show({
        content: t('user:emailChange.newEmail.placeholder'),
        position: 'top',
      });
      return;
    }

    if (!newCaptcha.trim()) {
      Toast.show({
        content: t('user:emailChange.newEmail.captchaPlaceholder'),
        position: 'top',
      });
      return;
    }

    const postUserEmailChangeEmailRes = await postUserEmailChangeEmailMutate({
      captcha,
      newEmail,
      newCaptcha,
    });
    switch (postUserEmailChangeEmailRes.statusCode) {
      case 4003:
      case 4005:
        setTimeout(() =>
          navigate(`/settings/email/change/captcha?email=${email}`, {
            replace: true,
          }),
        );
        return;
      case 200:
        setTimeout(() => navigate(-1));
    }
  }, [captcha, email, navigate, newCaptcha, newEmail, postUserEmailChangeEmailMutate, t]);

  if (!email || !captcha) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('user:emailChange.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-8">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-5 flex items-center gap-3 px-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary-light/60 text-primary-deep"><RefreshCw size={20} /></span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('user:emailChange.newStepTitle')}</h2>
              <p className="mt-0.5 text-[11px] text-ww-mid">{t('user:emailChange.newStepHint')}</p>
            </div>
          </div>
          <Surface className="space-y-4 px-5 py-5" material="raised">
            <FormField disabled label={t('user:info.email')} prefix={<Mail size={18} />} value={email} />
            <FormField
              label={t('user:email.newEmail')}
              value={newEmail}
              onChange={setNewEmail}
              placeholder={t('user:emailChange.newEmail.placeholder')}
              prefix={<Mail size={18} />}
            />
            <EmailCaptchaInput
              email={newEmail}
              placeholder={t('user:emailChange.newEmail.captchaPlaceholder')}
              value={newCaptcha}
              onChange={setNewCaptcha}
              onSend={onSendNewCaptcha}
            />
            <button className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45" disabled={!newEmail.trim() || !newCaptcha.trim()} onClick={() => void onSendChangeEmail()} type="button">{t('user:emailChange.submit')}</button>
          </Surface>
        </div>
      </main>
    </div>
  );
};

export default EmailChange;
