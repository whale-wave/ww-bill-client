import type { FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthFieldsVisual } from '@ww-bill/bill-ui';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, loginEmailCaptchaApi } from '@/entities/auth';
import { userKeys } from '@/entities/user';
import { AuthPageShell, AuthPrimaryButton, AuthSegmentedControl, isAuthRequiredRedirectState, useAuthStore } from '@/features/auth';
import { EmailCaptchaInput } from '@/features/email-captcha';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { FormField, PageLoadingState, showAppNotice } from '@/shared/ui';
import { beginLoginSubmission, finishLoginSubmission, isCurrentLoginSubmission, useLoginPageState } from './model/login-state';

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
  const isAuthRequired = isAuthRequiredRedirectState(location.state);
  const { startSession } = useAuthStore(({ startSession }) => ({ startSession }));
  const { userNameForm, setUserNameForm, emailForm, setEmailForm, loginType, setLoginType, isSubmitting, showLoading } = useLoginPageState();
  const loginOptions = useMemo(() => [
    { label: t('login.usernamePasswordLogin'), value: 'username' as const },
    { label: t('login.emailLogin'), value: 'email' as const },
  ], [t]);

  const handleLogin = useCallback(async () => {
    const submission = beginLoginSubmission();
    if (!submission)
      return;

    try {
      const { statusCode, data } = await login(
        loginType === 'username' ? userNameForm : emailForm,
      );
      if (!isCurrentLoginSubmission(submission))
        return;

      if (statusCode === 200) {
        const runtime = startSession(data.token, data.userInfo.userId || String(data.userInfo.id));
        (runtime?.queryClient ?? queryClient).setQueryData(userKeys.info(), {
          statusCode: 200,
          message: '',
          data: data.userInfo,
        });
        if (data.deletionCancelled)
          showAppNotice({ content: t('login.deletionCancelled'), icon: 'success' });
        const redirectLocation = getSafeRedirectLocation(location.state?.from);
        navigate(redirectLocation, { replace: true });
        return;
      }
    }
    catch {
      // HTTP interceptor displays error prompt automatically
    }
    finishLoginSubmission(submission);
  }, [emailForm, location.state, loginType, navigate, queryClient, startSession, t, userNameForm]);

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
      onBack={isAuthRequired ? undefined : () => navigate(-1)}
      title={t('login.title')}
    >
      {showLoading && <PageLoadingState label={t('login.loading')} testId="login-loading" />}
      <fieldset className={showLoading ? 'hidden' : 'm-0 min-w-0 border-0 p-0'} disabled={isSubmitting}>
        {location.state?.accountDeletionScheduledAt && <p className="m-0 rounded-xl bg-feedback-warning/10 px-3 py-2 text-[12px] font-semibold leading-5 text-feedback-warning">{t('login.deletionWaitingHint')}</p>}
        <AuthSegmentedControl
          ariaLabel={t('login.method')}
          onChange={setLoginType}
          options={loginOptions}
          value={loginType}
        />
        {loginType === 'username'
          ? (
              <AuthFieldsVisual>
                <FormField
                  autoComplete="username"
                  label={t('login.usernameLabel')}
                  onChange={username => setUserNameForm({ username })}
                  placeholder={t('login.usernamePlaceholder')}
                  prefix={<UserRound size={18} strokeWidth={1.8} />}
                  value={userNameForm.username}
                />
                <FormField
                  autoComplete="current-password"
                  label={t('login.passwordLabel')}
                  onChange={password => setUserNameForm({ password })}
                  onEnterPress={() => void handleLogin()}
                  placeholder={t('login.passwordPlaceholder')}
                  prefix={<LockKeyhole size={18} strokeWidth={1.8} />}
                  type="password"
                  value={userNameForm.password}
                />
              </AuthFieldsVisual>
            )
          : (
              <AuthFieldsVisual>
                <FormField
                  autoComplete="email"
                  inputMode="email"
                  label={t('login.emailLabel')}
                  onChange={email => setEmailForm({ email })}
                  placeholder={t('login.emailPlaceholder')}
                  prefix={<Mail size={18} strokeWidth={1.8} />}
                  type="email"
                  value={emailForm.email}
                />
                <EmailCaptchaInput
                  email={emailForm.email}
                  onChange={emailCode => setEmailForm({ emailCode })}
                  sendEmailApi={loginEmailCaptchaApi}
                  value={emailForm.emailCode}
                />
              </AuthFieldsVisual>
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
        <AuthPrimaryButton disabled={isSubmitting} onClick={() => void handleLogin()} testId="login-submit">
          {t('login.submit')}
        </AuthPrimaryButton>
      </fieldset>
    </AuthPageShell>
  );
};

export default Login;
