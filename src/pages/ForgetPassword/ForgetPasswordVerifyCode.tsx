import { FC, useCallback, useMemo, useState } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@/modules';
import { WwInput } from '@/pages/ForgetPassword/components';
import { Button, Toast } from 'antd-mobile';
import { WwInputVerifyCode } from '@/pages/ForgetPassword/components/WwInput';
import { Dayjs } from 'dayjs';

const ForgetPasswordVerifyCode: FC = () => {
  const navigate = useNavigate();
  const [email] = useState('layouwen@gmail.com');
  const [verifyCode, setVerifyCode] = useState('');
  const [startTime, setStartTime] = useState<Dayjs>();

  const isDisabled = useMemo(() => {
    if (!verifyCode || verifyCode.trim().length < 6) return true;
    return false;
  }, [verifyCode]);

  const onGoTo = useCallback((v: string | number) => {
    playSound.turnPage();
    navigate(v as any);
  }, []);

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, []);

  const onSendVerify = useCallback(async () => {
    // TODO: 请求接口
    return true;
  }, [verifyCode]);

  const onSend = useCallback(() => {
    setTimeout(() => {
      Toast.show({ content: '请稍后', position: 'top' });
    }, 300);

    setTimeout(() => {
      Toast.show({ position: 'top', content: '验证码错误!' });
    }, 600);

    setTimeout(() => {
      Toast.show({ position: 'top', content: '验证成功' });
      navigate('/forget-password/reset');
    }, 900);
  }, [email]);

  return (
    <div className={'page flex flex-col'}>
      <NavBar back="返回" onBack={onGoToBack}>
        找回密码
      </NavBar>
      <div className={'flex-grow flex flex-col items-center space-y-6 pt-10'}>
        <WwInput value={email} disabled clearable={false} />
        <WwInputVerifyCode
          placeholder={'请输入验证码'}
          value={verifyCode}
          onChange={setVerifyCode}
          startTime={startTime}
          setStartTime={setStartTime}
          onSend={onSendVerify}
        />
        <Button
          block
          className={'!w-[80%] !rounded-[12px] !mt-10 !text-black333'}
          color="primary"
          size="large"
          onClick={onSend}
          disabled={isDisabled}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default ForgetPasswordVerifyCode;
