import type { Dayjs } from 'dayjs';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getUserEmailChangeEmailCaptchaApi,
  getUserEmailChangeEmailCaptchaVerifyApi,
} from '@/entities/user-email';
import { WwInput, WwInputVerifyCode } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { NavBar, WwButton } from '@/shared/ui';

interface EmailChangeProps {}

const EmailChangeCaptcha: React.FC<EmailChangeProps> = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email') || '';
  const [captcha, setCaptcha] = useState<string>('');
  const [startTime, setStartTime] = useState<Dayjs>();

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onSendCaptcha = useCallback(async () => {
    const getUserEmailChangeEmailCaptchaRes
      = await getUserEmailChangeEmailCaptchaApi();
    return getUserEmailChangeEmailCaptchaRes.statusCode === 200;
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
    <div className="page">
      <NavBar back={t('emailChange.back')} onBack={onBack}>
        {t('emailChange.verifyEmail')}
      </NavBar>
      <div className="flex flex-grow flex-col items-center">
        <WwInput className="mt-16" value={email} readonly disabled />
        <WwInputVerifyCode
          className="mt-4"
          placeholder={t('emailChange.enterCaptcha')}
          value={captcha}
          onChange={setCaptcha}
          startTime={startTime}
          setStartTime={setStartTime}
          onSend={onSendCaptcha}
        />
        <WwButton onClick={onCaptchaVerify}>{t('emailChange.captcha.verify')}</WwButton>
      </div>
    </div>
  );
};

export default EmailChangeCaptcha;
