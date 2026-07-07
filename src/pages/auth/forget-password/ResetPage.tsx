import type { FC } from 'react';
import type {
  NavigateOptions,
} from 'react-router-dom';
import { Button, Toast } from 'antd-mobile';
import { useCallback, useState } from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { postAuthPasswordForgetResetApi } from '@/entities/auth';
import { WwInput } from '@/pages/auth/forget-password/ui';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { NavBar } from '@/shared/ui';

const ForgetPasswordReset: FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('login.email')!;
  const captcha = urlSearchParams.get('captcha')!;

  const onGoTo = useCallback(
    (v: string | number, options?: NavigateOptions) => {
      playSound.turnPage();
      navigate(v as any, options);
    },
    [],
  );

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, []);

  const onSend = useCallback(async () => {
    if (!password || !confirmPassword) {
      Toast.show({ content: t('forgetPassword.pleaseEnterPassword'), position: 'top' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ content: t('forgetPassword.passwordMismatch'), position: 'top' });
      return;
    }

    const postAuthPasswordForgetResetRes = await postAuthPasswordForgetResetApi(
      {
        email,
        captcha,
        password,
        confirmPassword,
      },
      true,
    );

    if (postAuthPasswordForgetResetRes.statusCode === 4005) {
      setTimeout(() => {
        onGoTo('/forget-password', {
          replace: true,
        });
      }, 400);
    }
    else if (postAuthPasswordForgetResetRes.statusCode === 200) {
      setTimeout(() => {
        navigate('/mine', {
          replace: true,
        });
      }, 400);
    }
  }, [password, confirmPassword, email, captcha]);

  return (
    <div className="page flex flex-col">
      <NavBar back={t('common:nav.back')} onBack={onGoToBack}>
        {t('forgetPassword.title')}
      </NavBar>
      <div className="flex-grow flex flex-col items-center space-y-6 pt-10">
        <WwInput
          value={password}
          onChange={setPassword}
          type="password"
          placeholder={t('forgetPassword.newPassword')}
        />
        <WwInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          type="password"
          placeholder={t('forgetPassword.confirmPassword')}
        />
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

export default ForgetPasswordReset;
