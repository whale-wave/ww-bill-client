import { FC, useCallback, useState } from 'react';
import { NavBar } from 'bw-mobile';
import { Path, useNavigate } from 'react-router-dom';
import { playSound } from '@/modules';
import { WwInput } from '@/pages/ForgetPassword/components';
import { Button, Dialog, Toast } from 'antd-mobile';
import { isEmail } from '@/utils';
import { getToolsForgetPasswordEmailApi } from '@/api';

const ForgetPassword: FC = () => {
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
        <div className={'flex flex-col items-center font-bold'}>
          <div>请确认邮箱</div>
          <div>{email}</div>
        </div>
      ),
      onConfirm: async () => {
        Toast.show({ content: '请稍后', position: 'top' });

        const getForgetPasswordEmailCaptchaRes =
          await getToolsForgetPasswordEmailApi(email);

        if (getForgetPasswordEmailCaptchaRes.statusCode === 200) {
          Toast.show({
            content: getForgetPasswordEmailCaptchaRes.message,
            position: 'top',
          });

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
    <div className={'page flex flex-col'}>
      <NavBar back="返回" onBack={onGoToBack}>
        找回密码
      </NavBar>
      <div className={'flex-grow flex flex-col items-center space-y-6 pt-10'}>
        <WwInput placeholder={'请输入邮箱'} value={email} onChange={setEmail} />
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

export default ForgetPassword;
