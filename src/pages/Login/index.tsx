import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components';
import { login, loginEmailCaptchaApi } from '@/entities/auth';
import { getToolsCaptchaApi } from '@/entities/tools';
import { userKeys } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { queryClient } from '@/main';
import { playSound } from '@/shared/lib/play-sound';
import { Button } from '@/shared/ui';
import styles from './index.module.scss';

const Login: FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuthStore(({ setToken }) => ({ setToken }));

  const [userNameForm, setUserNameForm] = useState({
    username: '',
    password: '',
    captcha: '',
  });
  const onUserNameFormFieldChange = useCallback(
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setUserNameForm(form => ({ ...form, [field]: e.target.value }));
    },
    [],
  );

  const [emailForm, setEmailForm] = useState({
    email: '',
    emailCode: '',
  });
  const onEmailFormFieldChange = useCallback(
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setEmailForm(form => ({ ...form, [field]: e.target.value }));
    },
    [],
  );

  const [loginType, setLoginType] = useState('username');
  const onToggleLoginType = useCallback(() => {
    setLoginType(type => (type === 'username' ? 'email' : 'username'));
  }, []);

  const [svgCaption, setSvgCaption] = useState('');
  const getCaptcha = useCallback(async () => {
    const data = await getToolsCaptchaApi();
    if (data) {
      setSvgCaption(
        data
          .replace(/width="\d+"/, 'width="100"')
          .replace(/height="\d+"/, 'height="38"'),
      );
    }
  }, []);

  const handleLogin = useCallback(async () => {
    const { statusCode, data } = await login(
      loginType === 'username' ? userNameForm : emailForm,
    );
    if (statusCode === 200) {
      setToken(data.token);
      queryClient.setQueryData(userKeys.info(), {
        statusCode: 200,
        message: '',
        data: data.userInfo,
      });
      setTimeout(navigate, 1000, -1);
    }
  }, [userNameForm, emailForm, loginType]);

  const onGoToForgetPassword = useCallback(() => {
    playSound.turnPage();
    navigate('/forget-password');
  }, []);

  useEffect(() => {
    void getCaptcha();
  }, []);

  return (
    <div className="page justify-center items-center">
      <div style={{ maxWidth: 313, transform: 'translateY(-4rem)' }}>
        {loginType === 'email' && (
          <>
            <div>
              <Input
                label="邮箱"
                placeholder="请输入邮箱"
                onChange={onEmailFormFieldChange('email')}
                value={emailForm.email}
              />
            </div>
            <div className="mt-3">
              <EmailCaptchaInput
                email={emailForm.email}
                value={emailForm.emailCode}
                onChange={onEmailFormFieldChange('emailCode')}
                sendEmailApi={loginEmailCaptchaApi}
              />
            </div>
          </>
        )}
        {loginType === 'username' && (
          <>
            <div>
              <Input
                label="账号"
                placeholder="请输入账号ID或邮箱"
                onChange={onUserNameFormFieldChange('username')}
                value={userNameForm.username}
              />
            </div>
            <div className="mt-3">
              <Input
                label="密码"
                placeholder="请输入密码"
                type="password"
                onChange={onUserNameFormFieldChange('password')}
                value={userNameForm.password}
              />
            </div>
            <div className="mt-3 relative">
              <Input
                label="验证码"
                placeholder="请输入验证码"
                onChange={onUserNameFormFieldChange('captcha')}
                value={userNameForm.captcha}
              />
              <div
                onClick={getCaptcha}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 10,
                  zIndex: 30,
                  display: 'inline-block',
                }}
                dangerouslySetInnerHTML={{ __html: svgCaption }}
              />
            </div>
          </>
        )}
        <div className="flex justify-between w-full mt-[20px]">
          <span onClick={onToggleLoginType}>
            {loginType === 'username' ? '邮箱登录' : '账号密码登录'}
          </span>
          <span onClick={onGoToForgetPassword}>忘记密码</span>
        </div>
        <Button className="mt-[40px]" block onClick={handleLogin}>
          登录
        </Button>
        <div className={styles.bottom}>
          <span className={styles.back} onClick={() => navigate(-1)}>
            返回
          </span>
          <span className={styles.sign} onClick={() => navigate('/sign')}>
            注册
          </span>
        </div>
      </div>
    </div>
  );
};
export default Login;
