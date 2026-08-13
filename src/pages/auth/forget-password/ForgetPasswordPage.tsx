import type { FC } from 'react';
import { Dialog, Toast } from 'antd-mobile';
import { Mail } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToolsForgetPasswordEmailApi } from '@/entities/auth';
import { AuthPageShell, AuthPrimaryButton } from '@/features/auth';
import { buildVerifyCodePath } from '@/pages/auth/forget-password/model/params';
import { useTranslation } from '@/shared/i18n';
import { isEmail } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';
import { FormField } from '@/shared/ui';

const ForgetPassword: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const handleSend = useCallback(() => {
    if (!isEmail(email)) {
      Toast.show({ position: 'top', content: t('forgetPassword.emailFormatError') });
      return;
    }
    void Dialog.confirm({
      cancelText: t('common:nav.cancel'),
      confirmText: t('common:nav.confirm'),
      content: (
        <div className="flex flex-col items-center font-bold">
          <div>{t('forgetPassword.confirmEmail')}</div>
          <div className="mt-2 font-number text-primary-deep">{email}</div>
        </div>
      ),
      onConfirm: async () => {
        const response = await getToolsForgetPasswordEmailApi(email, true);
        if (response.statusCode === 200) {
          setTimeout(() => {
            playSound.turnPage();
            navigate(buildVerifyCodePath(email));
          }, 200);
        }
      },
      title: t('forgetPassword.confirmEmailTitle'),
    });
  }, [email, navigate, t]);

  return (
    <AuthPageShell
      kicker={t('forgetPassword.stepEmail')}
      onBack={handleBack}
      subtitle={t('forgetPassword.emailSubtitle')}
      title={t('forgetPassword.title')}
    >
      <FormField
        autoComplete="email"
        inputMode="email"
        label={t('login.emailLabel')}
        onChange={setEmail}
        onEnterPress={handleSend}
        placeholder={t('forgetPassword.email')}
        prefix={<Mail size={18} strokeWidth={1.8} />}
        type="email"
        value={email}
      />
      <p className="mt-3 text-[11px] leading-4 text-ww-soft">{t('forgetPassword.emailHint')}</p>
      <AuthPrimaryButton onClick={handleSend} testId="password-recovery-next">
        {t('common:nav.next')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default ForgetPassword;
