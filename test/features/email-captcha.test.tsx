import { Toast } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailCaptchaInput } from '@/features/email-captcha';

let cleanup: (() => void) | undefined;

function render(props: Record<string, unknown>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(EmailCaptchaInput, {
    email: 'user@example.com',
    onChange: vi.fn(),
    value: '',
    ...props,
  })));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('email captcha input', () => {
  it('starts a 60 second cooldown only after a successful send', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const sendEmailApi = vi.fn().mockResolvedValue({ statusCode: 200 });
    const container = render({ sendEmailApi });
    const button = container.querySelector('button')!;

    await act(async () => button.click());

    expect(sendEmailApi).toHaveBeenCalledOnce();
    expect(button.textContent).toContain('60');

    act(() => vi.advanceTimersByTime(1000));
    expect(button.textContent).toContain('59');

    act(() => button.click());
    expect(sendEmailApi).toHaveBeenCalledOnce();
  });

  it('keeps the button available after a failed send', async () => {
    const sendEmailApi = vi.fn().mockResolvedValue({ statusCode: 4002 });
    const container = render({ sendEmailApi });
    const button = container.querySelector('button')!;

    await act(async () => button.click());

    expect(sendEmailApi).toHaveBeenCalledOnce();
    expect(button.textContent).toContain('获取验证码');
    expect(button.disabled).toBe(false);
  });

  it('explains when the registration email is already in use', async () => {
    const sendEmailApi = vi.fn().mockResolvedValue({ statusCode: 4018 });
    const showToast = vi.spyOn(Toast, 'show');
    const container = render({ sendEmailApi });
    const button = container.querySelector('button')!;

    await act(async () => button.click());

    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      content: '该邮箱已注册，请直接登录或更换邮箱',
    }));
    expect(button.textContent).toContain('获取验证码');
    expect(button.disabled).toBe(false);
  });
});
