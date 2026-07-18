import type { ChangeEvent, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForgetPasswordPage from '@/pages/auth/forget-password/ForgetPasswordPage';
import ResetPage from '@/pages/auth/forget-password/ResetPage';
import VerifyCodePage from '@/pages/auth/forget-password/VerifyCodePage';

const {
  confirmDialog,
  getForgetPasswordEmail,
  postPasswordReset,
  verifyForgetPasswordCode,
} = vi.hoisted(() => ({
  confirmDialog: vi.fn<(options: { onConfirm?: () => unknown }) => Promise<boolean>>(),
  getForgetPasswordEmail: vi.fn(),
  postPasswordReset: vi.fn(),
  verifyForgetPasswordCode: vi.fn(),
}));

vi.mock('@/entities/auth', () => ({
  getToolsForgetPasswordEmailApi: getForgetPasswordEmail,
  getToolsForgetPasswordEmailVerifyCodeApi: verifyForgetPasswordCode,
  postAuthPasswordForgetResetApi: postPasswordReset,
}));

vi.mock('antd-mobile', () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => unknown;
  }) => createElement('button', {
    disabled,
    onClick: () => onClick?.(),
  }, children),
  Dialog: { confirm: confirmDialog },
  Toast: { show: vi.fn() },
}));

vi.mock('@/pages/auth/forget-password/ui', () => ({
  WwInput: ({
    disabled,
    onChange,
    placeholder,
    type,
    value,
  }: {
    disabled?: boolean;
    onChange?: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'password';
    value: string;
  }) => createElement('input', {
    disabled,
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value),
    placeholder,
    type,
    value,
  }),
  WwInputVerifyCode: ({
    onChange,
    placeholder,
    value,
  }: {
    onChange?: (value: string) => void;
    placeholder?: string;
    value: string;
  }) => createElement('input', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value),
    placeholder,
    value,
  }),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib', () => ({
  isEmail: () => true,
}));

vi.mock('@/shared/lib/play-sound', () => ({
  playSound: { turnPage: vi.fn() },
}));

vi.mock('@/shared/ui', () => ({
  NavBar: ({ children }: { children: ReactNode }) => createElement('nav', null, children),
}));

let cleanup: (() => void) | undefined;

function renderAt(initialEntry: string) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/sentinel', element: createElement('div', null, 'sentinel') },
    { path: '/forget-password', element: createElement(ForgetPasswordPage) },
    { path: '/forget-password/verify-code', element: createElement(VerifyCodePage) },
    { path: '/forget-password/reset', element: createElement(ResetPage) },
    { path: '/mine', element: createElement('div', null, 'mine') },
  ], {
    initialEntries: ['/sentinel', initialEntry],
    initialIndex: 1,
  });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

function enterText(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  if (!setValue)
    throw new Error('Missing HTMLInputElement value setter');

  act(() => {
    setValue.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function getInput(container: HTMLElement, placeholder: string) {
  const input = container.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`);
  if (!input)
    throw new Error(`Missing input: ${placeholder}`);
  return input;
}

function getNextButton(container: HTMLElement) {
  const button = [...container.querySelectorAll('button')]
    .find(element => element.textContent === 'common:nav.next');
  if (!button)
    throw new Error('Missing next button');
  return button;
}

beforeEach(() => {
  vi.useFakeTimers();
  confirmDialog.mockReset();
  getForgetPasswordEmail.mockReset();
  postPasswordReset.mockReset();
  verifyForgetPasswordCode.mockReset();
  confirmDialog.mockImplementation(async ({ onConfirm }) => {
    await onConfirm?.();
    return true;
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
});

describe('password recovery pages', () => {
  it('navigates from email entry to verification with the exact Unicode/plus email', async () => {
    const email = '鲸浪+test@example.com';
    getForgetPasswordEmail.mockResolvedValue({ statusCode: 200 });
    const { container, router } = renderAt('/forget-password');

    enterText(getInput(container, 'forgetPassword.email'), email);
    await act(async () => getNextButton(container).click());
    await act(async () => vi.advanceTimersByTimeAsync(200));

    expect(getForgetPasswordEmail).toHaveBeenCalledWith(email, true);
    expect(router.state.location.pathname).toBe('/forget-password/verify-code');
    expect(new URLSearchParams(router.state.location.search).get('email')).toBe(email);
    expect(router.state.historyAction).toBe('PUSH');
  });

  it('reads email, verifies captcha, and replaces the route with both reset params', async () => {
    const email = '鲸浪+test@example.com';
    const captcha = '123456';
    const search = new URLSearchParams({ email });
    verifyForgetPasswordCode.mockResolvedValue({ statusCode: 200 });
    const { container, router } = renderAt(`/forget-password/verify-code?${search.toString()}`);

    expect(container.querySelector<HTMLInputElement>('input:disabled')?.value).toBe(email);
    enterText(getInput(container, 'captcha.placeholder'), captcha);
    await act(async () => getNextButton(container).click());
    await act(async () => vi.advanceTimersByTimeAsync(400));

    expect(verifyForgetPasswordCode).toHaveBeenCalledWith({ captcha, email }, true);
    expect(router.state.location.pathname).toBe('/forget-password/reset');
    expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({
      captcha,
      email,
    });
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('sends the routed email and captcha with the entered reset passwords', async () => {
    const email = '鲸浪+test@example.com';
    const captcha = '123456';
    const search = new URLSearchParams({ captcha, email });
    postPasswordReset.mockResolvedValue({ statusCode: 200 });
    const { container } = renderAt(`/forget-password/reset?${search.toString()}`);

    enterText(getInput(container, 'forgetPassword.newPassword'), 'new-password');
    enterText(getInput(container, 'forgetPassword.confirmPassword'), 'new-password');
    await act(async () => getNextButton(container).click());

    expect(postPasswordReset).toHaveBeenCalledWith({
      captcha,
      confirmPassword: 'new-password',
      email,
      password: 'new-password',
    }, true);
  });

  it('replaces verify-code with email entry when email is missing', () => {
    const { router } = renderAt('/forget-password/verify-code');

    expect(router.state.location.pathname).toBe('/forget-password');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it.each([
    '/forget-password/reset?captcha=123456',
    '/forget-password/reset?email=user%40example.com',
  ])('replaces reset with email entry when a required param is missing: %s', (initialEntry) => {
    const { router } = renderAt(initialEntry);

    expect(router.state.location.pathname).toBe('/forget-password');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});
