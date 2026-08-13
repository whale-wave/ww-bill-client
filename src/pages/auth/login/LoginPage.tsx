import type { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, loginEmailCaptchaApi } from '@/entities/auth';
import { userKeys } from '@/entities/user';
import { AuthPageShell, AuthPrimaryButton, AuthSegmentedControl, useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField } from '@/shared/ui';

interface RedirectLocation {
  pathname: string;
  search: string;
  hash: string;
}

type LoginType = 'email' | 'username';

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
  const [userNameForm, setUserNameForm] = useState({ username: '', password: '' });
  const [emailForm, setEmailForm] = useState({ email: '', emailCode: '' });
  const [loginType, setLoginType] = useState<LoginType>('username');
  const loginOptions = useMemo(() => [
    { label: t('login.usernamePasswordLogin'), value: 'username' as const },
    { label: t('login.emailLogin'), value: 'email' as const },
  ], [t]);

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

  const handleForgetPassword = useCallback(() => {
    playSound.turnPage();
    navigate('/forget-password');
  }, [navigate]);

  return (
    <AuthPageShell
      footer={(
        <span>
          {t('login.noAccount')}
          {' '}
          <button className="border-0 bg-transparent p-0 font-bold text-primary-deep" onClick={() => navigate('/sign')} type="button">
            {t('login.gotoSign')}
          </button>
        </span>
      )}
      kicker={t('brandKicker')}
      onBack={() => navigate(-1)}
      subtitle={t('login.subtitle')}
      title={t('login.title')}
    >
      <AuthSegmentedControl
        ariaLabel={t('login.method')}
        onChange={setLoginType}
        options={loginOptions}
        value={loginType}
      />
      {loginType === 'username'
        ? (
            <div className="space-y-4">
              <FormField
                autoComplete="username"
                label={t('login.usernameLabel')}
                onChange={username => setUserNameForm(form => ({ ...form, username }))}
                placeholder={t('login.usernamePlaceholder')}
                prefix={<UserRound size={18} strokeWidth={1.8} />}
                value={userNameForm.username}
              />
              <FormField
                autoComplete="current-password"
                label={t('login.passwordLabel')}
                onChange={password => setUserNameForm(form => ({ ...form, password }))}
                onEnterPress={() => void handleLogin()}
                placeholder={t('login.passwordPlaceholder')}
                prefix={<LockKeyhole size={18} strokeWidth={1.8} />}
                type="password"
                value={userNameForm.password}
              />
            </div>
          )
        : (
            <div className="space-y-4">
              <FormField
                autoComplete="email"
                inputMode="email"
                label={t('login.emailLabel')}
                onChange={email => setEmailForm(form => ({ ...form, email }))}
                placeholder={t('login.emailPlaceholder')}
                prefix={<Mail size={18} strokeWidth={1.8} />}
                type="email"
                value={emailForm.email}
              />
              <EmailCaptchaInput
                email={emailForm.email}
                onChange={emailCode => setEmailForm(form => ({ ...form, emailCode }))}
                sendEmailApi={loginEmailCaptchaApi}
                value={emailForm.emailCode}
              />
            </div>
          )}
      <div className="mt-4 flex justify-end">
        <button
          className="border-0 bg-transparent p-0 text-[12px] font-bold text-primary-deep"
          onClick={handleForgetPassword}
          type="button"
        >
          {t('login.forgotPassword')}
        </button>
      </div>
      <AuthPrimaryButton onClick={() => void handleLogin()} testId="login-submit">
        {t('login.submit')}
      </AuthPrimaryButton>
    </AuthPageShell>
  );
};

export default Login;
