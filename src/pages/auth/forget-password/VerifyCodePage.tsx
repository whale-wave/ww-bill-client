import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import { Button } from 'antd-mobile';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getToolsForgetPasswordEmailApi,
  getToolsForgetPasswordEmailVerifyCodeApi,
} from '@/entities/auth';
import { WwInput, WwInputVerifyCode } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { NavBar } from '@/shared/ui';

const ForgetPasswordVerifyCode: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [urlSearchParams] = useSearchParams();
  const [email] = useState(urlSearchParams.get('login.email') || '');
  const [startTime, setStartTime] = useState<Dayjs>();

  const isDisabled = useMemo(() => {
    if (!captcha || captcha.trim().length < 6)
      return true;
    return false;
  }, [captcha]);

  const onGoTo = useCallback((v: string | number) => {
    playSound.turnPage();
    navigate(v as Parameters<typeof navigate>[0]);
  }, [navigate]);

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, [onGoTo]);

  const onSendVerify = useCallback(async () => {
    const getForgetPasswordEmailCaptchaRes
      = await getToolsForgetPasswordEmailApi(email, true);

    return getForgetPasswordEmailCaptchaRes.statusCode === 200;
  }, [email]);

  const onSend = useCallback(async () => {
    const getToolsForgetPasswordEmailVerifyCodeRes
      = await getToolsForgetPasswordEmailVerifyCodeApi(
        {
          email,
          captcha,
        },
        true,
      );

    if (getToolsForgetPasswordEmailVerifyCodeRes.statusCode === 200) {
      setTimeout(() => {
        navigate(
          `/forget-password/reset?email=${encodeURIComponent(
            email,
          )}&captcha=${encodeURIComponent(captcha)}`,
          {
            replace: true,
          },
        );
      }, 400);
    }
  }, [captcha, email, navigate]);

  useEffect(() => {
    if (!email) {
      onGoTo('/mine');
    }
  }, [email, onGoTo]);

  return (
    <div className="page flex flex-col">
      <NavBar back={t('common:nav.back')} onBack={onGoToBack}>
        {t('forgetPassword.title')}
      </NavBar>
      <div className="flex-grow flex flex-col items-center space-y-6 pt-10">
        <WwInput value={email} disabled clearable={false} />
        <WwInputVerifyCode
          placeholder={t('captcha.placeholder')}
          value={captcha}
          onChange={setCaptcha}
          startTime={startTime}
          setStartTime={setStartTime}
          onSend={onSendVerify}
          autoCountdown={true}
        />
        <Button
          block
          className="!w-[80%] !rounded-[12px] !mt-10 !text-black333"
          color="primary"
          size="large"
          onClick={onSend}
          disabled={isDisabled}
        >
          {t('common:nav.next')}
        </Button>
      </div>
    </div>
  );
};

export default ForgetPasswordVerifyCode;
