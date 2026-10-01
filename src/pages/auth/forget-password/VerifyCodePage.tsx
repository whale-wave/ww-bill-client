import type { FC } from 'react';
import { Mail } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getToolsForgetPasswordEmailApi,
  getToolsForgetPasswordEmailVerifyCodeApi,
} from '@/entities/auth';
import { AuthPageShell, AuthPrimaryButton } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { buildResetPath, readPasswordRecoveryParams } from '@/pages/auth/forget-password/model/params';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField, showAppError } from '@/shared/ui';

const ForgetPasswordVerifyCode: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownStartedAt] = useState(() => Date.now());
  const [urlSearchParams] = useSearchParams();
  const { email } = readPasswordRecoveryParams(urlSearchParams);
  const isDisabled = useMemo(() => captcha.trim().length < 6, [captcha]);

  const handleBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const handleResend = useCallback(async () => {
    return getToolsForgetPasswordEmailApi(email);
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting)
      return;
    setIsSubmitting(true);
    try {
      const response = await getToolsForgetPasswordEmailVerifyCodeApi({ email, captcha: captcha.trim() });
      if (response.statusCode === 200) {
        setTimeout(() => {
          navigate(buildResetPath({ captcha: captcha.trim(), email }), { replace: true });
        }, 400);
      }
      else {
        showAppError(undefined, { message: response.message });
      }
    }
    catch {
      // HTTP interceptor displays error prompt automatically
    }
    finally {
      setIsSubmitting(false);
    }
  }, [captcha, email, isSubmitting, navigate]);

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
        <EmailCaptchaInput
          cooldownStartedAt={cooldownStartedAt}
          email={email}
          label={t('sign.captcha')}
          onChange={setCaptcha}
          onSend={handleResend}
          placeholder={t('captcha.placeholder')}
          value={captcha}
        />
      </div>
      <AuthPrimaryButton disabled={isDisabled} loading={isSubmitting} onClick={() => void handleSubmit()} testId="password-recovery-next">
        {t('common:nav.next')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default ForgetPasswordVerifyCode;
