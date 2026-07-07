import dayjs, { type Dayjs } from 'dayjs';
import { Toast } from 'antd-mobile';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserEmailChangeEmailCaptchaNewEmailApi, usePostUserEmailChangeEmailMutation } from '@/entities/user-email';
import { WwInput, WwInputVerifyCode } from '@/pages/auth/forget-password/ui';
import { NavBar, WwButton } from '@/shared/ui';
import { useTranslation } from '@/shared/i18n';

interface EmailChangeProps {}

const EmailChange: React.FC<EmailChangeProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email') || '';
  const captcha = urlSearchParams.get('captcha') || '';
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCaptcha, setNewCaptcha] = useState<string>('');
  const [startTime, setStartTime] = useState<Dayjs>();
  const [postUserEmailChangeEmailMutate]
    = usePostUserEmailChangeEmailMutation();

  const onBack = useCallback(() => navigate(-1), []);

  const onSendNewCaptcha = useCallback(async () => {
    if (!newEmail.trim()) {
      Toast.show({
        content: t('user:emailChange.newEmail.placeholder'),
        position: 'top',
      });
      return false;
    }
    const getUserEmailChangeEmailCaptchaNewEmailRes
      = await getUserEmailChangeEmailCaptchaNewEmailApi({
        newEmail,
        captcha,
      });
    switch (getUserEmailChangeEmailCaptchaNewEmailRes.statusCode) {
      case 4003:
      case 4005:
        setTimeout(() =>
          navigate(`/settings/email/change/captcha?email=${email}`, {
            replace: true,
          }),
        );
        return false;
      case 200:
        return true;
      default:
        return false;
    }
  }, [newEmail, captcha, t]);

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
  }, [captcha, newCaptcha, newEmail, t]);

  if (!email || !captcha) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page">
      <NavBar back={t('common:nav.back')} onBack={onBack}>
        {t('user:emailChange.title')}
      </NavBar>
      <div className="flex flex-grow flex-col items-center">
        <WwInput className="mt-16" value={email} readonly disabled />
        <WwInput
          className="mt-4"
          value={newEmail}
          onChange={setNewEmail}
          placeholder={t('user:emailChange.newEmail.placeholder')}
        />
        <WwInputVerifyCode
          className="mt-4"
          placeholder={t('user:emailChange.newEmail.captchaPlaceholder')}
          value={newCaptcha}
          onChange={setNewCaptcha}
          startTime={startTime}
          setStartTime={setStartTime}
          onSend={onSendNewCaptcha}
        />
        <WwButton onClick={onSendChangeEmail}>{t('user:emailChange.submit')}</WwButton>
      </div>
    </div>
  );
};

export default EmailChange;
