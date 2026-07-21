import type { ChangeEvent, FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, loginEmailCaptchaApi } from '@/entities/auth';
import { getToolsCaptchaApi } from '@/entities/tools';
import { userKeys } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { Button, Input } from '@/shared/ui';
import styles from './index.module.scss';

interface RedirectLocation {
  pathname: string;
  search: string;
  hash: string;
}

function getSafeRedirectLocation(from: unknown): RedirectLocation | '/' {
  if (!from || typeof from !== 'object')
    return '/';

  const { hash, pathname, search } = from as Record<string, unknown>;
  if (
    typeof pathname !== 'string'
    || !pathname.startsWith('/')
    || /^\/[\\/]/.test(pathname)
  ) {
    return '/';
  }

  return {
    pathname,
    search: typeof search === 'string' && search.startsWith('?') ? search : '',
    hash: typeof hash === 'string' && hash.startsWith('#') ? hash : '',
  };
}

const Login: FC = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      const redirectLocation = getSafeRedirectLocation(location.state?.from);
      setTimeout(navigate, 1000, redirectLocation, { replace: true });
    }
  }, [emailForm, location.state, loginType, navigate, queryClient, setToken, userNameForm]);

  const onGoToForgetPassword = useCallback(() => {
    playSound.turnPage();
    navigate('/forget-password');
  }, [navigate]);

  useEffect(() => {
    void getCaptcha();
  }, [getCaptcha]);

  return (
    <div className="page justify-center items-center">
      <div style={{ maxWidth: 313, transform: 'translateY(-4rem)' }}>
        {loginType === 'email' && (
          <>
            <div>
              <Input
                label={t('login.emailLabel')}
                placeholder={t('login.emailPlaceholder')}
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
                label={t('login.usernameLabel')}
                placeholder={t('login.usernamePlaceholder')}
                onChange={onUserNameFormFieldChange('username')}
                value={userNameForm.username}
              />
            </div>
            <div className="mt-3">
              <Input
                label={t('login.passwordLabel')}
                placeholder={t('login.passwordPlaceholder')}
                type="password"
                onChange={onUserNameFormFieldChange('password')}
                value={userNameForm.password}
              />
            </div>
            <div className="mt-3 relative">
              <Input
                label={t('login.captchaLabel')}
                placeholder={t('login.captchaPlaceholder')}
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
            {loginType === 'username' ? t('login.emailLogin') : t('login.usernamePasswordLogin')}
          </span>
          <span onClick={onGoToForgetPassword}>{t('login.forgotPassword')}</span>
        </div>
        <Button className="mt-[40px]" block onClick={handleLogin}>
          {t('login.submit')}
        </Button>
        <div className={styles.bottom}>
          <span className={styles.back} onClick={() => navigate(-1)}>
            {t('login.back')}
          </span>
          <span className={styles.sign} onClick={() => navigate('/sign')}>
            {t('login.register')}
          </span>
        </div>
      </div>
    </div>
  );
};
export default Login;
