import type { FC } from 'react';
import type { Path } from 'react-router-dom';
import { Button, Dialog, Toast } from 'antd-mobile';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToolsForgetPasswordEmailApi } from '@/entities/auth';
import { WwInput } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { isEmail } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';
import { NavBar } from '@/shared/ui';

const ForgetPassword: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const onGoTo = useCallback((v: string | Partial<Path> | number) => {
    playSound.turnPage();
    navigate(v as any);
  }, []);

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, []);

  const onSend = useCallback(() => {
    if (!isEmail(email)) {
      Toast.show({ position: 'top', content: '邮箱格式错误' });
      return;
    }
    void Dialog.confirm({
      content: (
        <div className="flex flex-col items-center font-bold">
          <div>请确认邮箱</div>
          <div>{email}</div>
        </div>
      ),
      onConfirm: async () => {
        const getForgetPasswordEmailCaptchaRes
          = await getToolsForgetPasswordEmailApi(email, true);

        if (getForgetPasswordEmailCaptchaRes.statusCode === 200) {
          setTimeout(() => {
            onGoTo(
              `/forget-password/verify-code?email=${encodeURIComponent(email)}`,
            );
          }, 200);
        }
      },
    });
  }, [email]);

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
