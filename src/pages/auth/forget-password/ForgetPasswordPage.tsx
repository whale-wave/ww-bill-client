import type { FC } from 'react';
import { Button, Dialog, Toast } from 'antd-mobile';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToolsForgetPasswordEmailApi } from '@/entities/auth';
import { buildVerifyCodePath } from '@/pages/auth/forget-password/model/params';
import { WwInput } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { isEmail } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';
import { NavBar } from '@/shared/ui';

const ForgetPassword: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const onGoTo = useCallback((to: string) => {
    playSound.turnPage();
    navigate(to);
  }, [navigate]);

  const onGoToBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, [navigate]);

  const onSend = useCallback(() => {
    if (!isEmail(email)) {
      Toast.show({ position: 'top', content: t('forgetPassword.emailFormatError') });
      return;
    }
    void Dialog.confirm({
      content: (
        <div className="flex flex-col items-center font-bold">
          <div>{t('forgetPassword.confirmEmail')}</div>
          <div>{email}</div>
        </div>
      ),
      onConfirm: async () => {
        const getForgetPasswordEmailCaptchaRes
          = await getToolsForgetPasswordEmailApi(email, true);

        if (getForgetPasswordEmailCaptchaRes.statusCode === 200) {
          setTimeout(() => {
            onGoTo(buildVerifyCodePath(email));
          }, 200);
        }
      },
    });
  }, [email, onGoTo, t]);

  return (
    <div className="page flex flex-col">
      <NavBar back={t('common:nav.back')} onBack={onGoToBack}>
        {t('forgetPassword.title')}
      </NavBar>
      <div className="flex-grow flex flex-col items-center space-y-6 pt-10">
        <WwInput placeholder={t('forgetPassword.email')} value={email} onChange={setEmail} />
        <Button
          block
          className="!w-[80%] !rounded-[12px] !mt-10 !text-black333"
          color="primary"
          size="large"
          onClick={onSend}
        >
          {t('common:nav.next')}
        </Button>
      </div>
    </div>
  );
};

export default ForgetPassword;
