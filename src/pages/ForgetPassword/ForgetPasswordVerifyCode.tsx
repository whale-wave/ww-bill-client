import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { playSound } from '@/modules';
import { WwInput } from '@/pages/ForgetPassword/components';
import { Button, Toast } from 'antd-mobile';
import { WwInputVerifyCode } from '@/pages/ForgetPassword/components/WwInput';
import { Dayjs } from 'dayjs';
import {
  getToolsForgetPasswordEmailApi,
  getToolsForgetPasswordEmailVerifyCodeApi,
} from '@/api';

const ForgetPasswordVerifyCode: FC = () => {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [urlSearchParams] = useSearchParams();
  const [email] = useState(urlSearchParams.get('email') || '');
  const [startTime, setStartTime] = useState<Dayjs>();

  const isDisabled = useMemo(() => {
    if (!captcha || captcha.trim().length < 6) return true;
    return false;
  }, [captcha]);

  const onGoTo = useCallback((v: string | number) => {
    playSound.turnPage();
    navigate(v as any);
  }, []);

  const onGoToBack = useCallback(() => {
    onGoTo(-1);
  }, []);

  const onSendVerify = useCallback(async () => {
    const getForgetPasswordEmailCaptchaRes =
      await getToolsForgetPasswordEmailApi(email);

    if (getForgetPasswordEmailCaptchaRes.statusCode === 200) {
      Toast.show({
        content: getForgetPasswordEmailCaptchaRes.message,
        position: 'top',
      });
      return true;
    }

    return false;
  }, [captcha]);

  const onSend = useCallback(async () => {
    Toast.show({ content: '请稍后', position: 'top' });

    const getToolsForgetPasswordEmailVerifyCodeRes =
      await getToolsForgetPasswordEmailVerifyCodeApi({
        email,
        captcha,
      });

    if (getToolsForgetPasswordEmailVerifyCodeRes.statusCode === 200) {
      Toast.show({ position: 'top', content: '验证成功' });
      setTimeout(() => {
        navigate(
          `/forget-password/reset?email=${encodeURIComponent(
            email,
          )}&captcha=${encodeURIComponent(captcha)}`,
        );
      }, 400);
    }
  }, [email, captcha]);

  useEffect(() => {
    if (!email) {
      onGoTo('/mine');
    }
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
          value={captcha}
          onChange={setCaptcha}
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
