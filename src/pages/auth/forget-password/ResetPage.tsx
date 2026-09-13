import type { FC } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postAuthPasswordForgetResetApi } from '@/entities/auth';
import { AuthPageShell, AuthPrimaryButton } from '@/features/auth';
import { readPasswordRecoveryParams } from '@/pages/auth/forget-password/model/params';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField, showAppError } from '@/shared/ui';

const ForgetPasswordReset: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const [urlSearchParams] = useSearchParams();
  const { captcha, email } = readPasswordRecoveryParams(urlSearchParams);

  const handleBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    if (!password || !confirmPassword) {
      setValidationError(t('forgetPassword.pleaseEnterPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t('forgetPassword.passwordMismatch'));
      return;
    }
    setValidationError(undefined);

    const response = await postAuthPasswordForgetResetApi({
      email,
      captcha,
      password,
      confirmPassword,
    });

    if (response.statusCode === 4005) {
      navigate('/forget-password', { replace: true });
    }
    else if (response.statusCode === 200) {
      navigate('/login', { replace: true });
    }
    else {
      showAppError(undefined, { message: response.message, fallbackMessage: t('forgetPassword.resetFailed') });
    }
  }, [captcha, confirmPassword, email, navigate, password, t]);

  useEffect(() => {
    if (!email || !captcha)
      navigate('/forget-password', { replace: true });
  }, [captcha, email, navigate]);

  return (
    <AuthPageShell
      kicker={t('forgetPassword.stepReset')}
      onBack={handleBack}
      subtitle={t('forgetPassword.resetSubtitle')}
      title={t('forgetPassword.resetPassword')}
    >
      <div className="space-y-4">
        <FormField
          autoComplete="new-password"
          label={t('forgetPassword.newPassword')}
          onChange={setPassword}
          placeholder={t('forgetPassword.newPasswordPlaceholder')}
          prefix={<LockKeyhole size={18} strokeWidth={1.8} />}
          type="password"
          value={password}
          errorMessage={validationError && !confirmPassword ? validationError : undefined}
        />
        <FormField
          autoComplete="new-password"
          label={t('forgetPassword.confirmPassword')}
          onChange={setConfirmPassword}
          onEnterPress={() => void handleSubmit()}
          placeholder={t('forgetPassword.confirmPasswordPlaceholder')}
          prefix={<LockKeyhole size={18} strokeWidth={1.8} />}
          type="password"
          value={confirmPassword}
          errorMessage={validationError}
        />
      </div>
      <p className="mt-3 text-[11px] leading-4 text-ww-soft">{t('sign.passwordRule')}</p>
      <AuthPrimaryButton onClick={() => void handleSubmit()} testId="password-recovery-next">
        {t('forgetPassword.resetPassword')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default ForgetPasswordReset;
