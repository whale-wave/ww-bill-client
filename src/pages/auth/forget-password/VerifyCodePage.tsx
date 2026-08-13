import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import dayjs from 'dayjs';
import { Mail } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getToolsForgetPasswordEmailApi,
  getToolsForgetPasswordEmailVerifyCodeApi,
} from '@/entities/auth';
import { AuthPageShell, AuthPrimaryButton } from '@/features/auth';
import { buildResetPath, readPasswordRecoveryParams } from '@/pages/auth/forget-password/model/params';
import { WwInputVerifyCode } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField } from '@/shared/ui';

const ForgetPasswordVerifyCode: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [urlSearchParams] = useSearchParams();
  const { email } = readPasswordRecoveryParams(urlSearchParams);
  const [startTime, setStartTime] = useState<Dayjs | undefined>(() => dayjs());
  const isDisabled = useMemo(() => captcha.trim().length < 6, [captcha]);

  const handleBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const handleResend = useCallback(async () => {
    const response = await getToolsForgetPasswordEmailApi(email, true);
    return response.statusCode === 200;
  }, [email]);

  const handleSubmit = useCallback(async () => {
    const response = await getToolsForgetPasswordEmailVerifyCodeApi({ email, captcha }, true);
    if (response.statusCode === 200) {
      setTimeout(() => {
        navigate(buildResetPath({ captcha, email }), { replace: true });
      }, 400);
    }
  }, [captcha, email, navigate]);

  useEffect(() => {
    if (!email)
      navigate('/forget-password', { replace: true });
  }, [email, navigate]);

  return (
    <AuthPageShell
      kicker={t('forgetPassword.stepVerify')}
      onBack={handleBack}
      subtitle={t('forgetPassword.verifySubtitle')}
      title={t('forgetPassword.verifyCode')}
    >
      <div className="space-y-4">
        <FormField
          disabled
          label={t('login.emailLabel')}
          prefix={<Mail size={18} strokeWidth={1.8} />}
          value={email}
        />
        <WwInputVerifyCode
          label={t('sign.captcha')}
          onChange={setCaptcha}
          onSend={handleResend}
          placeholder={t('captcha.placeholder')}
          setStartTime={setStartTime}
          startTime={startTime}
          value={captcha}
        />
      </div>
      <AuthPrimaryButton disabled={isDisabled} onClick={() => void handleSubmit()} testId="password-recovery-next">
        {t('common:nav.next')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default ForgetPasswordVerifyCode;
