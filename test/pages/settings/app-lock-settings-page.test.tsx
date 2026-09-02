import type { ReactElement } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppLockGuard } from '@/features/app-lock';
import AppLockSettingsPage from '@/pages/app-lock-settings/AppLockSettingsPage';

const mocks = vi.hoisted(() => ({
  config: {
    gestureLockEnabled: false,
    id: 'config-1',
    isDisplayAmount: false,
    isDisplayAmountSwitch: false,
    isOpenHapticEffect: false,
    isLedgerQuickSwitchEnabled: false,
    isOpenMotionEffect: true,
    isOpenSoundEffect: false,
    ledgerQuickSwitchVersion: 1,
    appearanceTemplate: 'fresh' as const,
    appearanceAccent: 'sky' as const,
    userId: 7,
  },
  createCredential: vi.fn(async () => ({
    algorithm: 'PBKDF2-SHA256',
    digest: 'digest',
    iterations: 120000,
    salt: 'salt',
  })),
  getCredential: vi.fn(),
  getCredentialStatus: vi.fn(() => 'missing'),
  getLockState: vi.fn(() => ({ failedAttempts: 0, lockedUntil: null })),
  login: vi.fn(async () => ({ statusCode: 200 })),
  patchConfig: vi.fn(async () => ({ statusCode: 200 })),
  removeCredential: vi.fn(),
  removeLockState: vi.fn(),
  refetchConfig: vi.fn(async () => ({ data: undefined })),
  saveCredential: vi.fn(),
  verifyPattern: vi.fn(async () => true),
}));

vi.mock('antd-mobile', () => ({
  Toast: { show: vi.fn() },
}));

vi.mock('@/entities/app-lock', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/entities/app-lock')>();
  return {
    ...original,
    APP_LOCK_MIN_POINTS: 4,
    createAppLockCredential: mocks.createCredential,
    isAppLockTemporarilyLocked: () => false,
    isTooSimplePattern: () => false,
    localAppLockStorage: {
      getCredential: mocks.getCredential,
      getCredentialStatus: mocks.getCredentialStatus,
      getLockState: mocks.getLockState,
      removeCredential: mocks.removeCredential,
      removeLockState: mocks.removeLockState,
      saveCredential: mocks.saveCredential,
    },
    recordAppLockFailure: vi.fn(),
    verifyAppLockPattern: mocks.verifyPattern,
  };
});

vi.mock('@/entities/auth', () => ({
  login: mocks.login,
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({ data: { username: 'test-user' } }),
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: () => ({
    data: mocks.config,
    refetch: mocks.refetchConfig,
  }),
  usePatchUserAppConfigMutation: () => [
    mocks.patchConfig,
    { isLoading: false },
  ],
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', async () => {
  const { createElement } = await import('react');
  return {
    AppButton: ({
      children,
      disabled,
      loading,
      loadingLabel,
      ...props
    }: {
      children: ReactElement | string;
      disabled?: boolean;
      loading?: boolean;
      loadingLabel?: string;
    }) => createElement(
      'button',
      {
        ...props,
        'aria-busy': loading || undefined,
        'disabled': disabled || loading,
      },
      loading ? loadingLabel : children,
    ),
    FormField: ({ onChange, value }: { onChange?: (value: string) => void; value?: string }) => createElement('input', {
      onInput: (event: Event) => onChange?.((event.target as HTMLInputElement).value),
      type: 'password',
      value,
    }),
    GradientPanel: ({ children }: { children: ReactElement | ReactElement[] }) => createElement('section', null, children),
    PageHeader: ({ title }: { title: string }) => createElement('header', null, title),
  };
});

let cleanup = () => {};

function renderPage(initialEntry: string | { pathname: string; state?: unknown } = '/settings/app-lock') {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(
    MemoryRouter,
    { initialEntries: [initialEntry] },
    createElement(AppLockSettingsPage),
  )));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

function renderGuard(children: ReactElement, initialEntries = ['/home']) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    {
      path: '*',
      element: (
        <AppLockGuard
          config={mocks.config}
          isError={false}
          isLoading={false}
          token="token"
        >
          {children}
        </AppLockGuard>
      ),
    },
  ], { initialEntries });
  act(() => root.render(<RouterProvider router={router} />));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

function buttonByText(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(button => button.textContent === text);
}

function dispatchPointer(
  element: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  clientX: number,
  clientY: number,
) {
  const event = new MouseEvent(type, { bubbles: true, clientX, clientY });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  element.dispatchEvent(event);
}

function drawPattern(container: HTMLElement) {
  const svg = container.querySelector<SVGSVGElement>('[data-pattern-gesture] svg');
  if (!svg)
    throw new Error('Pattern gesture is missing');
  let hasPointerCapture = false;
  svg.getBoundingClientRect = () => ({
    bottom: 300,
    height: 300,
    left: 0,
    right: 300,
    toJSON: () => ({}),
    top: 0,
    width: 300,
    x: 0,
    y: 0,
  });
  svg.setPointerCapture = () => {
    hasPointerCapture = true;
  };
  svg.hasPointerCapture = () => hasPointerCapture;
  svg.releasePointerCapture = () => {
    hasPointerCapture = false;
  };
  dispatchPointer(svg, 'pointerdown', 50, 50);
  dispatchPointer(svg, 'pointermove', 150, 50);
  dispatchPointer(svg, 'pointermove', 150, 150);
  dispatchPointer(svg, 'pointermove', 150, 250);
  dispatchPointer(svg, 'pointerup', 150, 250);
}

function LocationProbe() {
  const location = useLocation();
  const state = location.state as { recovery?: boolean } | null;
  return createElement(
    'output',
    { 'data-testid': 'location-probe' },
    `${location.pathname}:${state?.recovery === true ? 'recovery' : ''}`,
  );
}

describe('app lock settings page', () => {
  beforeEach(() => {
    mocks.config.gestureLockEnabled = false;
    mocks.getCredential.mockReturnValue(null);
    mocks.getCredentialStatus.mockReturnValue('missing');
    mocks.login.mockResolvedValue({ statusCode: 200 });
    mocks.patchConfig.mockResolvedValue({ statusCode: 200 });
  });

  afterEach(() => {
    cleanup();
    cleanup = () => {};
    vi.clearAllMocks();
  });

  it('enables app lock after drawing and confirming the same pattern', async () => {
    const container = renderPage();

    act(() => {
      drawPattern(container);
    });

    expect(container.textContent).toContain('appLock.confirm');

    await act(async () => {
      drawPattern(container);
    });

    expect(mocks.saveCredential).toHaveBeenCalledWith(7, expect.any(Object));
    expect(mocks.patchConfig).toHaveBeenCalledWith({ gestureLockEnabled: true });
  });

  it('shows an error and allows retry when credential creation fails', async () => {
    mocks.config.gestureLockEnabled = true;
    const container = renderPage();
    act(() => {
      drawPattern(container);
    });
    mocks.createCredential.mockRejectedValueOnce(new Error('unavailable'));

    await act(async () => {
      drawPattern(container);
    });

    expect(container.textContent).toContain('common:error.loadFail');
    expect(buttonByText(container, 'appLock.reset')?.disabled).toBe(false);
    expect(mocks.patchConfig).not.toHaveBeenCalled();
    expect(mocks.refetchConfig).not.toHaveBeenCalled();
  });

  it('keeps the credential and shows an error when config recovery also fails', async () => {
    const container = renderPage();
    act(() => {
      drawPattern(container);
    });
    mocks.patchConfig.mockRejectedValueOnce(new Error('network error'));
    mocks.refetchConfig.mockRejectedValueOnce(new Error('network error'));

    await act(async () => {
      drawPattern(container);
    });

    expect(container.textContent).toContain('common:error.loadFail');
    expect(mocks.saveCredential).toHaveBeenCalledWith(7, expect.any(Object));
    expect(mocks.removeCredential).not.toHaveBeenCalled();
  });

  it.each(['appLock.change', 'appLock.disable'])(
    'enters verification from the enabled action %s',
    (actionLabel) => {
      mocks.config.gestureLockEnabled = true;
      mocks.getCredential.mockReturnValue({ digest: 'digest' });
      mocks.getCredentialStatus.mockReturnValue('valid');
      const container = renderPage();

      act(() => buttonByText(container, actionLabel)?.click());

      expect(container.textContent).toContain('appLock.unlock');
    },
  );

  it('verifies the existing pattern on release before changing it', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.change')?.click());
    await act(async () => drawPattern(container));

    expect(mocks.verifyPattern).toHaveBeenCalledWith(
      [1, 2, 5, 8],
      { digest: 'digest' },
    );
    expect(container.textContent).toContain('appLock.setupTitle');
  });

  it('enters account recovery from an enabled app lock', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());

    expect(container.textContent).toContain('appLock.recoveryDescription');
  });

  it('opens account recovery immediately when entered from the lock screen', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = renderPage({
      pathname: '/settings/app-lock',
      state: { recovery: true },
    });

    expect(container.textContent).toContain('appLock.recoveryDescription');
    expect(container.textContent).not.toContain('appLock.change');
    expect(container.textContent).not.toContain('appLock.disable');
  });

  it.each([
    { statusCode: 400, description: 'an HTTP credential error' },
    { statusCode: 103, description: 'a legacy business credential error' },
  ])('shows a password error for $description', async ({ statusCode }) => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.login.mockRejectedValueOnce(Object.assign(new Error('invalid credentials'), { statusCode }));
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'wrong-password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(container.textContent).toContain('appLock.passwordIncorrect');
    expect(container.textContent).not.toContain('appLock.wrong');
    expect(mocks.patchConfig).not.toHaveBeenCalled();
    expect(mocks.removeCredential).not.toHaveBeenCalled();
  });

  it('handles a credential error returned as a business response', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.login.mockResolvedValueOnce({ statusCode: 103 });
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'wrong-password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(container.textContent).toContain('appLock.passwordIncorrect');
    expect(mocks.patchConfig).not.toHaveBeenCalled();
  });

  it('shows a recovery error for technical login failures', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.login.mockRejectedValueOnce(Object.assign(new Error('network error'), { statusCode: 0 }));
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(container.textContent).toContain('appLock.recoveryFailed');
    expect(container.textContent).not.toContain('appLock.wrong');
    expect(mocks.patchConfig).not.toHaveBeenCalled();
  });

  it('disables recovery submission and ignores repeated clicks while verifying', async () => {
    let resolveLogin: ((response: { statusCode: number }) => void) | undefined;
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.login.mockImplementationOnce(() => new Promise((resolve) => {
      resolveLogin = resolve;
    }));
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const submitButton = buttonByText(container, 'appLock.submit');
    if (!submitButton)
      throw new Error('Recovery submit button is missing');
    act(() => submitButton.click());

    expect(submitButton.disabled).toBe(true);
    expect(container.textContent).toContain('appLock.verifying');
    act(() => submitButton.click());
    expect(mocks.login).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLogin?.({ statusCode: 400 });
    });
  });

  it('only clears app lock state after account verification and disabling both succeed', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'correct-password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(mocks.login).toHaveBeenCalledWith({ username: 'test-user', password: 'correct-password' }, false);
    expect(mocks.patchConfig).toHaveBeenCalledWith({ gestureLockEnabled: false });
    expect(mocks.removeCredential).toHaveBeenCalledWith(7);
    expect(mocks.removeLockState).toHaveBeenCalledWith(7);
  });

  it('keeps app lock state when disabling fails after account verification', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.patchConfig.mockRejectedValueOnce(new Error('network error'));
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());
    const input = container.querySelector<HTMLInputElement>('input[type="password"]');
    if (!input)
      throw new Error('Recovery password input is missing');
    act(() => {
      input.value = 'correct-password';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(container.textContent).toContain('appLock.recoveryFailed');
    expect(mocks.removeCredential).not.toHaveBeenCalled();
    expect(mocks.removeLockState).not.toHaveBeenCalled();
  });

  it('submits the latest swipe pattern immediately when unlocking', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container } = renderGuard(<div data-testid="protected-content" />);

    await act(async () => {
      drawPattern(container);
    });

    expect(mocks.getCredential).toHaveBeenCalledWith(7);
    expect(mocks.verifyPattern).toHaveBeenCalledWith(
      [1, 2, 5, 8],
      { digest: 'digest' },
    );
    expect(container.querySelector('[data-testid="protected-content"]')).not.toBeNull();
  });

  it('returns to the default detail page after the first unlock from settings', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container, router } = renderGuard(
      <div data-testid="protected-content" />,
      ['/settings'],
    );

    await act(async () => {
      drawPattern(container);
    });

    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('keeps the original route after the first unlock outside settings', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container, router } = renderGuard(
      <div data-testid="protected-content" />,
      ['/record-calendar'],
    );

    await act(async () => {
      drawPattern(container);
    });

    expect(router.state.location.pathname).toBe('/record-calendar');
    expect(router.state.historyAction).toBe('POP');
  });

  it('passes the recovery intent from the lock screen to settings', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container } = renderGuard(<LocationProbe />);

    act(() => buttonByText(container, 'appLock.recovery')?.click());

    expect(container.querySelector('[data-testid="location-probe"]')?.textContent)
      .toBe('/settings/app-lock:recovery');
  });

  it('cancels browser back navigation while the lock screen is active', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { router } = renderGuard(
      <div data-testid="protected-content" />,
      ['/previous', '/home'],
    );

    act(() => {
      router.navigate(-1);
    });

    expect(router.state.location.pathname).toBe('/home');
  });

  it('restores touch styles after leaving the lock screen', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    const previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    renderGuard(<div data-testid="protected-content" />);

    expect(document.body.style.touchAction).toBe('none');
    expect(document.body.style.overscrollBehavior).toBe('none');
    expect(document.documentElement.style.overscrollBehavior).toBe('none');

    cleanup();
    cleanup = () => {};
    expect(document.body.style.touchAction).toBe(previousBodyTouchAction);
    expect(document.body.style.overscrollBehavior).toBe(previousBodyOverscrollBehavior);
    expect(document.documentElement.style.overscrollBehavior).toBe(previousHtmlOverscrollBehavior);
  });

  it('allows browser back navigation after the lock is unlocked', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container, router } = renderGuard(
      <div data-testid="protected-content" />,
      ['/previous', '/home'],
    );

    await act(async () => {
      drawPattern(container);
    });
    act(() => {
      router.navigate(-1);
    });

    expect(router.state.location.pathname).toBe('/previous');
  });

  it('shows saving state and ignores repeated gestures during final setup', async () => {
    let resolveCredential: ((credential: {
      algorithm: 'PBKDF2-SHA256';
      digest: string;
      iterations: number;
      salt: string;
    }) => void) | undefined;
    mocks.createCredential.mockImplementationOnce(() => new Promise((resolve) => {
      resolveCredential = resolve;
    }));
    const container = renderPage();

    act(() => drawPattern(container));
    act(() => drawPattern(container));

    expect(container.textContent).toContain('appLock.processing');
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(buttonByText(container, 'appLock.reset')?.disabled).toBe(true);
    expect(mocks.createCredential).toHaveBeenCalledTimes(1);

    act(() => drawPattern(container));
    expect(mocks.createCredential).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCredential?.({
        algorithm: 'PBKDF2-SHA256',
        digest: 'digest',
        iterations: 120000,
        salt: 'salt',
      });
    });

    expect(mocks.patchConfig).toHaveBeenCalledTimes(1);
  });

  it('locks again after the app moves to the background', async () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const { container } = renderGuard(<div data-testid="protected-content" />);
    const previousCleanup = cleanup;
    cleanup = () => {
      previousCleanup();
      Reflect.deleteProperty(document, 'visibilityState');
    };

    await act(async () => drawPattern(container));
    expect(container.querySelector('[data-testid="protected-content"]')).not.toBeNull();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull();
    expect(container.querySelector('[data-pattern-gesture]')).not.toBeNull();
  });

  it('does not unlock from a verification that finishes after backgrounding', async () => {
    let resolveVerification: ((isValid: boolean) => void) | undefined;
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    mocks.verifyPattern.mockImplementationOnce(() => new Promise((resolve) => {
      resolveVerification = resolve;
    }));
    const { container } = renderGuard(<div data-testid="protected-content" />);
    const previousCleanup = cleanup;
    cleanup = () => {
      previousCleanup();
      Reflect.deleteProperty(document, 'visibilityState');
    };

    act(() => drawPattern(container));
    expect(container.textContent).toContain('appLock.verifying');

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await act(async () => resolveVerification?.(true));

    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull();
    expect(container.querySelector('[data-pattern-gesture]')).not.toBeNull();
  });
});
