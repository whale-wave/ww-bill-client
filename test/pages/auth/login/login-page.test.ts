import type { ChangeEvent, ReactNode } from 'react';
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
  AuthPrimaryButton: ({ children, onClick }: { children: ReactNode; onClick: () => unknown }) => createElement('button', { onClick }, children),
  AuthSegmentedControl: () => null,
  isAuthRequiredRedirectState: (state: unknown) => Boolean(state && typeof state === 'object' && (state as { kind?: string }).kind === 'auth-required'),
  useAuthStore: (selector: (state: { startSession: typeof startSession }) => unknown) => selector({ startSession }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ setQueryData }),
}));

vi.mock('@/features/email-captcha', () => ({
  EmailCaptchaInput: () => null,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/play-sound', () => ({
  playSound: { turnPage: vi.fn() },
}));

vi.mock('@/shared/ui', () => ({
  FormField: ({ onChange, value }: { onChange?: (value: string) => void; value: string }) => createElement('input', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value),
    value,
  }),
}));

let cleanup: (() => void) | undefined;

function renderAt(initialEntry: string | { pathname: string; state?: unknown }) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/', element: createElement('div', null, 'home') },
    { path: '/login', element: createElement(LoginPage) },
    { path: '/protected', element: createElement('div', null, 'protected') },
    { path: '/sentinel', element: createElement('div', null, 'sentinel') },
  ], {
    initialEntries: ['/sentinel', initialEntry],
    initialIndex: 1,
  });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

async function submitLogin(container: HTMLElement) {
  const button = [...container.querySelectorAll('button')]
    .find(element => element.textContent === 'login.submit');
  if (!button)
    throw new Error('Missing login button');

  await act(async () => button.click());
  await act(async () => vi.advanceTimersByTimeAsync(1000));
}

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

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
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
});
