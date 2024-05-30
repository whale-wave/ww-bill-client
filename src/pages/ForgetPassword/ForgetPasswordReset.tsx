import { FC, useCallback, useState } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@/modules';
import { WwInput } from '@/pages/ForgetPassword/components';
import { Button, Toast } from 'antd-mobile';

const ForgetPasswordRest: FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onGoTo = useCallback((v: string | number) => {
    playSound.turnPage();
    navigate(v as any);
  }, []);

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, []);

  const onSend = useCallback(() => {
    if (!password || !confirmPassword) {
      Toast.show({ content: '请输入密码', position: 'top' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ content: '两次密码不一致', position: 'top' });
      return;
    }

    setTimeout(() => {
      Toast.show({ content: '请稍后', position: 'top' });
    }, 300);

    setTimeout(() => {
      Toast.show({ position: 'top', content: '修改成功' });
      navigate('/mine');
    }, 900);
  }, [password, confirmPassword]);

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
