import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ login: vi.fn(), startSession: vi.fn() }));
vi.mock('../../miniapp/src/entities/auth', () => ({ login: auth.login }));
vi.mock('@tarojs/components', async () => {
  const actual = await vi.importActual<typeof import('./mocks/components')>('@tarojs/components');
  return {
    ...actual,
    Input: ({ onInput, password, onConfirm: _onConfirm, ...props }: { onInput?: (event: { detail: { value: string } }) => void; password?: boolean; onConfirm?: () => void }) => createElement('input', {
      ...props,
      type: password ? 'password' : 'text',
      onInput: (event: { currentTarget: HTMLInputElement }) => onInput?.({ detail: { value: event.currentTarget.value } }),
    }),
  };
});

vi.mock('../../miniapp/src/features/auth', () => ({ useAuthStore: { getState: () => ({ startSession: auth.startSession }) } }));

let LoginPage: typeof import('../../miniapp/src/pages/login/index').default;
let cleanup: (() => void) | undefined;
beforeAll(async () => {
  process.env.TARO_PLATFORM = 'web';
  LoginPage = (await import('../../miniapp/src/pages/login/index')).default;
});
beforeEach(() => {
  auth.login.mockReset();
  auth.startSession.mockReset();
});
afterEach(() => cleanup?.());

function renderPage() {
  const container = document.createElement('div');
  const root = createRoot(container);
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } }, logger: { log: () => {}, warn: () => {}, error: () => {} } });
  act(() => root.render(createElement(QueryClientProvider, { client: queryClient }, createElement(LoginPage))));
  cleanup = () => {
    act(() => root.unmount());
    queryClient.clear();
  };
  return container;
}

function input(element: Element, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('miniapp login presentation and request state', () => {
  it('toggles password visibility without changing its draft or sending a request', () => {
    const page = renderPage();
    const password = page.querySelectorAll('input')[1];
    input(password, 'visibility-test');
    const toggle = page.querySelector('.bill-form-field__suffix-action')!;
    expect(password.type).toBe('password');
    act(() => toggle.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(password.type).toBe('text');
    expect(password.value).toBe('visibility-test');
    act(() => toggle.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(password.type).toBe('password');
    expect(password.value).toBe('visibility-test');
    expect(auth.login).not.toHaveBeenCalled();
  });
  it('keeps empty validation local', () => {
    const page = renderPage();
    act(() => page.querySelector('button.bill-auth-primary-action')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(page.textContent).toContain('请输入账号和密码');
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('prevents duplicate requests and restores the form after failure', async () => {
    let reject: ((reason: Error) => void) | undefined;
    auth.login.mockImplementationOnce(() => new Promise((_, rejectPromise) => reject = rejectPromise));
    const page = renderPage();
    const fields = page.querySelectorAll('input');
    input(fields[0], ' demo ');
    input(fields[1], 'test-password');
    const button = page.querySelector('button.bill-auth-primary-action')!;
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(auth.login).toHaveBeenCalledWith('demo', 'test-password');
    await vi.waitFor(() => expect(button.classList).toContain('bill-auth-primary-action--disabled'));
    expect(page.querySelectorAll('.bill-form-field__frame--disabled')).toHaveLength(2);
    expect(button.textContent).toContain('正在登录…');
    await act(async () => reject?.(new Error('网络异常')));
    await vi.waitFor(() => expect(button.classList).not.toContain('bill-auth-primary-action--disabled'));
    expect(page.textContent).toContain('网络异常');
    expect(page.querySelectorAll('.bill-form-field__frame--disabled')).toHaveLength(0);
    auth.login.mockResolvedValueOnce({ token: 'test-token', userInfo: { id: 1 } });
    await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(auth.login).toHaveBeenCalledTimes(2);
    expect(auth.startSession).toHaveBeenCalledWith('test-token', '1');
  });
});
