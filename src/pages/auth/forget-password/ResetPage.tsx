import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { LockKeyhole } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postAuthPasswordForgetResetApi } from '@/entities/auth';
import { AuthPageShell, AuthPrimaryButton } from '@/features/auth';
import { readPasswordRecoveryParams } from '@/pages/auth/forget-password/model/params';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField } from '@/shared/ui';

const ForgetPasswordReset: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [urlSearchParams] = useSearchParams();
  const { captcha, email } = readPasswordRecoveryParams(urlSearchParams);

  const handleBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    if (!password || !confirmPassword) {
      Toast.show({ content: t('forgetPassword.pleaseEnterPassword'), position: 'top' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ content: t('forgetPassword.passwordMismatch'), position: 'top' });
      return;
    }

    const response = await postAuthPasswordForgetResetApi({
      email,
      captcha,
      password,
      confirmPassword,
    }, true);

    if (response.statusCode === 4005) {
      setTimeout(navigate, 400, '/forget-password', { replace: true });
    }
    else if (response.statusCode === 200) {
      Toast.show({ content: t('forgetPassword.resetSuccess') });
      setTimeout(navigate, 400, '/login', { replace: true });
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
