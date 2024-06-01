import { FC, useCallback, useState } from 'react';
import { NavBar } from 'bw-mobile';
import {
  NavigateOptions,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { playSound } from '@/modules';
import { WwInput } from '@/pages/ForgetPassword/components';
import { Button, Toast } from 'antd-mobile';
import { postAuthPasswordForgetResetApi } from '@/api';

const ForgetPasswordRest: FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [urlSearchParams] = useSearchParams();
  const email = urlSearchParams.get('email')!;
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
      Toast.show({ content: '请输入密码', position: 'top' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ content: '两次密码不一致', position: 'top' });
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
      return;
    } else if (postAuthPasswordForgetResetRes.statusCode === 200) {
      setTimeout(() => {
        navigate('/mine', {
          replace: true,
        });
      }, 400);
    }
  }, [password, confirmPassword, email, captcha]);

  return (
    <div className={'page flex flex-col'}>
      <NavBar back="返回" onBack={onGoToBack}>
        找回密码
      </NavBar>
      <div className={'flex-grow flex flex-col items-center space-y-6 pt-10'}>
        <WwInput
          value={password}
          onChange={setPassword}
          type={'password'}
          placeholder={'新密码'}
        />
        <WwInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          type={'password'}
          placeholder={'确认密码'}
        />
        <Button
          block
          className={'!w-[80%] !rounded-[12px] !mt-10 !text-black333'}
          color="primary"
          size="large"
          onClick={onSend}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default ForgetPasswordRest;
