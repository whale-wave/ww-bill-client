import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '@/pages/auth/login/LoginPage';

const {
  login,
  startSession,
  setQueryData,
} = vi.hoisted(() => ({
  login: vi.fn(),
  startSession: vi.fn(),
  setQueryData: vi.fn(),
}));

vi.mock('@/entities/auth', () => ({
  login,
  loginEmailCaptchaApi: vi.fn(),
}));

vi.mock('@/entities/user', () => ({
  userKeys: { info: () => ['user', 'info'] },
}));

vi.mock('@/features/auth', () => ({
  AuthPageShell: ({ children, footer, onBack }: { children: ReactNode; footer?: ReactNode; onBack?: () => unknown }) => createElement('main', null, onBack ? createElement('button', { 'aria-label': '返回', 'onClick': onBack }) : null, children, footer),
  AuthPrimaryButton: ({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => unknown }) => createElement('button', { 'data-testid': 'login-submit', disabled, onClick }, children),
  AuthSegmentedControl: ({ onChange }: { onChange: (value: string) => void }) => createElement('button', { 'data-testid': 'email-login', 'onClick': () => onChange('email') }, 'email'),
  isAuthRequiredRedirectState: (state: unknown) => Boolean(state && typeof state === 'object' && (state as { kind?: string }).kind === 'auth-required'),
  useAuthStore: (selector: (state: { startSession: typeof startSession }) => unknown) => selector({ startSession }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ setQueryData }),
}));

vi.mock('@/features/email-captcha', () => ({
  EmailCaptchaInput: ({ onChange, value }: { onChange: (value: string) => void; value: string }) => createElement('input', { onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value), value }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/play-sound', () => ({
  playSound: { turnPage: vi.fn() },
}));

vi.mock('@/shared/ui', () => ({
  PageLoadingState: ({ label, testId }: { label: ReactNode; testId: string }) => createElement('div', { 'data-testid': testId, 'role': 'status' }, label),
  showAppNotice: vi.fn(),
  FormField: ({ onChange, onEnterPress, value }: { onChange?: (value: string) => void; onEnterPress?: () => void; value: string }) => createElement('input', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && onEnterPress?.(),
    value,
  }),
}));

let cleanup: (() => void) | undefined;

function renderAt(initialEntry: string | { pathname: string; state?: unknown }, options?: { remountOnSession?: boolean; lazyProtected?: () => Promise<{ Component: () => ReactNode }> }) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/', element: createElement('div', null, 'home') },
    { path: '/login', element: createElement(LoginPage) },
    { path: '/protected', ...(options?.lazyProtected ? { lazy: options.lazyProtected } : { element: createElement('div', null, 'protected') }) },
    { path: '/sentinel', element: createElement('div', null, 'sentinel') },
  ], {
    initialEntries: ['/sentinel', initialEntry],
    initialIndex: 1,
  });

  act(() => root.render(createElement(RouterProvider, { router })));
  if (options?.remountOnSession) {
    startSession.mockImplementation(() => {
      root.render(createElement(RouterProvider, { key: 'new-session', router }));
    });
  }
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

async function submitLogin(container: HTMLElement) {
  const button = [...container.querySelectorAll('button')]
    .find(element => element.textContent === 'login.submit');
  if (!button)
    throw new Error('Missing login button');

  await act(async () => button.click());
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function fillInputs(container: HTMLElement, values: string[]) {
  await act(async () => {
    container.querySelectorAll('input').forEach((input, index) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, values[index]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
}

const loginSuccess = {
  statusCode: 200,
  data: { token: 'new-token', userInfo: { id: 'user-id' } },
};

beforeEach(() => {
  vi.useFakeTimers();
  login.mockReset();
  startSession.mockReset();
  setQueryData.mockReset();
  login.mockResolvedValue({
    statusCode: 200,
    data: { token: 'new-token', userInfo: { id: 'user-id' } },
  });
});

afterEach(async () => {
  cleanup?.();
  await act(async () => {});
  cleanup = undefined;
  vi.useRealTimers();
});

describe('login transition feedback', () => {
  it('navigates immediately without showing loading for a fast login', async () => {
    const { container, router } = renderAt('/login');
    await submitLogin(container);

    expect(router.state.location.pathname).toBe('/');
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
  });

  it('shows loading only after 300ms and blocks repeated submissions', async () => {
    const request = deferred<typeof loginSuccess>();
    login.mockReturnValue(request.promise);
    const { container } = renderAt('/login');
    await fillInputs(container, ['account', 'secret']);
    await submitLogin(container);
    await submitLogin(container);
    await act(async () => container.querySelectorAll('input')[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));

    expect(login).toHaveBeenCalledTimes(1);
    expect(container.querySelector('fieldset')?.disabled).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(299));
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(container.querySelector('[data-testid="login-loading"]')?.textContent).toBe('login.loading');

    await act(async () => request.resolve(loginSuccess));
    expect(container.textContent).toBe('home');
  });

  it('preserves the filled form through session remount and covers a slow destination', async () => {
    const destination = deferred<{ Component: () => ReactNode }>();
    const { container, router } = renderAt({ pathname: '/login', state: { from: { pathname: '/protected' } } }, {
      remountOnSession: true,
      lazyProtected: () => destination.promise,
    });
    await fillInputs(container, ['account', 'secret']);
    await submitLogin(container);

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(router.state.navigation.state).toBe('loading');
    expect([...container.querySelectorAll('input')].map(input => input.value)).toEqual(['account', 'secret']);
    expect(container.querySelector('fieldset')?.disabled).toBe(true);
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
    await act(async () => vi.advanceTimersByTimeAsync(300));
    expect(container.querySelector('[data-testid="login-loading"]')).not.toBeNull();

    await act(async () => destination.resolve({ Component: () => 'protected' }));
    expect(router.state.location.pathname).toBe('/protected');
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
    await act(async () => router.navigate('/login'));
    expect([...container.querySelectorAll('input')].map(input => input.value)).toEqual(['', '']);
    expect(container.querySelector('fieldset')?.disabled).toBe(false);
  });

  it('does not restart the loading delay when a slow request remounts the page', async () => {
    const request = deferred<typeof loginSuccess>();
    const destination = deferred<{ Component: () => ReactNode }>();
    login.mockReturnValue(request.promise);
    const { container } = renderAt({ pathname: '/login', state: { from: { pathname: '/protected' } } }, {
      remountOnSession: true,
      lazyProtected: () => destination.promise,
    });
    await submitLogin(container);
    await act(async () => vi.advanceTimersByTimeAsync(300));
    await act(async () => request.resolve(loginSuccess));
    expect(container.querySelector('[data-testid="login-loading"]')).not.toBeNull();
    await act(async () => destination.resolve({ Component: () => 'protected' }));
  });

  it('cancels delayed feedback when the destination is ready within 300ms', async () => {
    const destination = deferred<{ Component: () => ReactNode }>();
    const { container } = renderAt({ pathname: '/login', state: { from: { pathname: '/protected' } } }, {
      remountOnSession: true,
      lazyProtected: () => destination.promise,
    });
    await submitLogin(container);
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
    await act(async () => destination.resolve({ Component: () => 'protected' }));
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(container.textContent).toBe('protected');
    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
  });

  it('restores the form after an error and allows retry', async () => {
    const request = deferred<typeof loginSuccess>();
    login.mockReturnValueOnce(request.promise);
    const { container } = renderAt('/login');
    await fillInputs(container, ['account', 'secret']);
    await submitLogin(container);
    await act(async () => vi.advanceTimersByTimeAsync(300));
    await act(async () => request.reject(new Error('Network error')));

    expect(container.querySelector('[data-testid="login-loading"]')).toBeNull();
    expect(container.querySelector('fieldset')?.disabled).toBe(false);
    expect([...container.querySelectorAll('input')].map(input => input.value)).toEqual(['account', 'secret']);
    await submitLogin(container);
    expect(login).toHaveBeenCalledTimes(2);
  });

  it('unlocks submission for an unsuccessful business response', async () => {
    login.mockResolvedValueOnce({ statusCode: 400 });
    const { container } = renderAt('/login');
    await submitLogin(container);
    expect(container.querySelector('fieldset')?.disabled).toBe(false);
    expect(startSession).not.toHaveBeenCalled();
  });

  it('applies the same delayed loading to email login', async () => {
    const request = deferred<typeof loginSuccess>();
    login.mockReturnValue(request.promise);
    const { container } = renderAt('/login');
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="email-login"]')!.click());
    await fillInputs(container, ['test@example.com', '123456']);
    await submitLogin(container);
    expect(login).toHaveBeenCalledWith({ email: 'test@example.com', emailCode: '123456' });
    await act(async () => vi.advanceTimersByTimeAsync(300));
    expect(container.querySelector('[data-testid="login-loading"]')).not.toBeNull();
    await act(async () => request.resolve(loginSuccess));
  });

  it('ignores a response after leaving and clears the next login form', async () => {
    const request = deferred<typeof loginSuccess>();
    login.mockReturnValue(request.promise);
    const { container, router } = renderAt('/login');
    await fillInputs(container, ['account', 'secret']);
    await submitLogin(container);
    await act(async () => router.navigate('/'));
    await act(async () => request.resolve(loginSuccess));
    expect(startSession).not.toHaveBeenCalled();
    await act(async () => router.navigate('/login'));
    expect([...container.querySelectorAll('input')].map(input => input.value)).toEqual(['', '']);
    expect(container.querySelector('fieldset')?.disabled).toBe(false);
  });
});

describe('login redirect', () => {
  it('hides the back action for a forced authentication redirect', () => {
    const { container } = renderAt({
      pathname: '/login',
      state: { kind: 'auth-required', from: { pathname: '/detail', search: '', hash: '' } },
    });

    expect(container.querySelector('button[aria-label="返回"]')).toBeNull();
  });

  it('keeps the back action for a directly opened login page', () => {
    const { container } = renderAt('/login');

    expect(container.querySelector('button[aria-label="返回"]')).not.toBeNull();
  });

  it('submits username and password without rendering a captcha field', async () => {
    const { container } = renderAt('/login');

    expect(container.querySelectorAll('input')).toHaveLength(2);

    await submitLogin(container);

    expect(login).toHaveBeenCalledWith({
      username: '',
      password: '',
    });
  });

  it('replaces the login page with the original internal location after login', async () => {
    const { container, router } = renderAt({
      pathname: '/login',
      state: {
        from: {
          pathname: '/protected',
          search: '?tab=overview',
          hash: '#summary',
        },
      },
    });

    await submitLogin(container);

    expect(router.state.location).toMatchObject({
      pathname: '/protected',
      search: '?tab=overview',
      hash: '#summary',
    });
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('replaces the login page with the safe default route when no original location exists', async () => {
    const { container, router } = renderAt('/login');

    await submitLogin(container);

    expect(router.state.location.pathname).toBe('/');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('rejects an external original location and uses the safe default route', async () => {
    const { container, router } = renderAt({
      pathname: '/login',
      state: {
        from: {
          pathname: '//example.com',
          search: '?token=leak',
        },
      },
    });

    await submitLogin(container);

    expect(router.state.location.pathname).toBe('/');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('handles login rejections without throwing unhandled promise rejection', async () => {
    login.mockRejectedValue(new Error('密码错误'));
    const { container, router } = renderAt('/login');

    await expect(submitLogin(container)).resolves.not.toThrow();
    expect(router.state.location.pathname).toBe('/login');
  });
});
