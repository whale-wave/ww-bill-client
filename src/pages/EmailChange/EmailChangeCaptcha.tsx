import type { Dayjs } from 'dayjs';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getUserEmailChangeEmailCaptchaApi,
  getUserEmailChangeEmailCaptchaVerifyApi,
} from '@/api/user-email';
import { NavBar } from '@/components/ui/index.ts';
import WwButton from '@/components/WwButton';
import { WwInput, WwInputVerifyCode } from '@/pages/ForgetPassword/components';

interface EmailChangeProps {}

const EmailChange: React.FC<EmailChangeProps> = () => {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email') || '';
  const [captcha, setCaptcha] = useState<string>('');
  const [startTime, setStartTime] = useState<Dayjs>();

  const onBack = useCallback(() => navigate(-1), []);

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
  }, [captcha, email]);

  if (!email) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page">
      <NavBar back="返回" onBack={onBack}>
        验证邮箱
      </NavBar>
      <div className="flex flex-grow flex-col items-center">
        <WwInput className="mt-16" value={email} readonly disabled />
        <WwInputVerifyCode
          className="mt-4"
          placeholder="请输入验证码"
          value={captcha}
          onChange={setCaptcha}
          startTime={startTime}
          setStartTime={setStartTime}
          onSend={onSendCaptcha}
        />
        <WwButton onClick={onCaptchaVerify}>验证</WwButton>
      </div>
    </div>
  );
};

export default EmailChange;
