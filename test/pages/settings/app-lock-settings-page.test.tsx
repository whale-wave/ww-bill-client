import type { ReactElement } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppLockGuard } from '@/features/app-lock';
import AppLockSettingsPage from '@/pages/app-lock-settings/AppLockSettingsPage';

const mocks = vi.hoisted(() => ({
  config: {
    gestureLockEnabled: false,
    id: 'config-1',
    isDisplayAmount: false,
    isDisplayAmountSwitch: false,
    isLedgerQuickSwitchEnabled: false,
    isOpenSoundEffect: false,
    ledgerQuickSwitchVersion: 1,
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
  patchConfig: vi.fn(async () => undefined),
  removeCredential: vi.fn(),
  removeLockState: vi.fn(),
  saveCredential: vi.fn(),
}));

vi.mock('antd-mobile', () => ({
  Toast: { show: vi.fn() },
}));

vi.mock('@/entities/app-lock', async () => {
  const { createElement } = await import('react');
  return {
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
    PatternGesture: ({ onChange }: { onChange: (pattern: number[]) => void }) => createElement(
      'button',
      {
        'data-testid': 'draw-pattern',
        'onClick': () => onChange([1, 2, 5, 8]),
        'type': 'button',
      },
      'draw pattern',
    ),
    recordAppLockFailure: vi.fn(),
    verifyAppLockPattern: vi.fn(async () => true),
  };
});

vi.mock('@/entities/auth', () => ({
  login: vi.fn(),
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({ data: { username: 'test-user' } }),
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: () => ({
    data: mocks.config,
    refetch: vi.fn(async () => ({ data: undefined })),
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
    FormField: () => createElement('input'),
    GradientPanel: ({ children }: { children: ReactElement | ReactElement[] }) => createElement('section', null, children),
    PageHeader: ({ title }: { title: string }) => createElement('header', null, title),
  };
});

let cleanup = () => {};

function renderPage() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(
    MemoryRouter,
    { initialEntries: ['/settings/app-lock'] },
    createElement(AppLockSettingsPage),
  )));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

function buttonByText(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(button => button.textContent === text);
}

describe('app lock settings page', () => {
  beforeEach(() => {
    mocks.config.gestureLockEnabled = false;
    mocks.getCredential.mockReturnValue(null);
    mocks.getCredentialStatus.mockReturnValue('missing');
  });

  afterEach(() => {
    cleanup();
    cleanup = () => {};
    vi.clearAllMocks();
  });

  it('enables app lock after drawing and confirming the same pattern', async () => {
    const container = renderPage();

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="draw-pattern"]')?.click());
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(container.textContent).toContain('appLock.confirm');

    act(() => container.querySelector<HTMLButtonElement>('[data-testid="draw-pattern"]')?.click());
    await act(async () => buttonByText(container, 'appLock.submit')?.click());

    expect(mocks.saveCredential).toHaveBeenCalledWith(7, expect.any(Object));
    expect(mocks.patchConfig).toHaveBeenCalledWith({ gestureLockEnabled: true });
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

  it('enters account recovery from an enabled app lock', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = renderPage();

    act(() => buttonByText(container, 'appLock.recovery')?.click());

    expect(container.textContent).toContain('appLock.recoveryDescription');
  });

  it('loads the device credential with the explicit app config user id', () => {
    mocks.config.gestureLockEnabled = true;
    mocks.getCredential.mockReturnValue({ digest: 'digest' });
    mocks.getCredentialStatus.mockReturnValue('valid');
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(
      <MemoryRouter initialEntries={['/home']}>
        <AppLockGuard
          config={mocks.config}
          isError={false}
          isLoading={false}
          token="token"
        >
          <div data-testid="protected-content" />
        </AppLockGuard>
      </MemoryRouter>,
    ));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    expect(mocks.getCredential).toHaveBeenCalledWith(7);
    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull();
  });
});
