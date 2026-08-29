import type { ShortcutAccessTokenSummary } from '@/entities/shortcut-bookkeeping';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShortcutBookkeepingSettingsPage from '@/pages/shortcut-bookkeeping-settings/ShortcutBookkeepingSettingsPage';

const mocks = vi.hoisted(() => ({
  confirmAction: vi.fn(async () => true),
  copyFallback: vi.fn(() => true),
  installUrl: 'https://www.icloud.com/shortcuts/template123' as string | undefined,
  issue: vi.fn(),
  openInstaller: vi.fn(),
  revoke: vi.fn(),
  tokens: [] as ShortcutAccessTokenSummary[],
  writeText: vi.fn(),
}));

vi.mock('antd-mobile', async (importOriginal) => {
  const original = await importOriginal<typeof import('antd-mobile')>();
  return { ...original, Toast: { show: vi.fn() } };
});

vi.mock('copy-to-clipboard', () => ({ default: mocks.copyFallback }));

vi.mock('@/entities/shortcut-bookkeeping', () => ({
  useIssueShortcutAccessTokenMutation: () => ({ isLoading: false, mutateAsync: mocks.issue }),
  useRevokeShortcutAccessTokenMutation: () => ({ isLoading: false, mutateAsync: mocks.revoke }),
  useShortcutAccessTokensQuery: () => ({ data: mocks.tokens, isError: false, isLoading: false }),
}));

vi.mock('@/pages/shortcut-bookkeeping-settings/model', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/pages/shortcut-bookkeeping-settings/model')>();
  return {
    ...original,
    getConfiguredIosShortcutInstallUrl: () => mocks.installUrl,
    openIosShortcutInstallUrl: mocks.openInstaller,
  };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/ui')>();
  return { ...original, confirmAppAction: mocks.confirmAction };
});

let cleanup = () => {};

function renderPage() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <MemoryRouter>
      <ShortcutBookkeepingSettingsPage />
    </MemoryRouter>,
  ));
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

function inputText(input: HTMLInputElement, value: string) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setValue?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
  mocks.installUrl = 'https://www.icloud.com/shortcuts/template123';
  mocks.tokens = [];
  mocks.copyFallback.mockReturnValue(true);
  mocks.issue.mockResolvedValue({ token: 'wws_test-credential' });
  mocks.writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: mocks.writeText },
  });
});

afterEach(() => {
  cleanup();
  cleanup = () => {};
  vi.clearAllMocks();
});

describe('shortcut bookkeeping settings page', () => {
  it('creates and copies a credential before opening the official installer', async () => {
    const container = renderPage();
    const input = container.querySelector<HTMLInputElement>('input')!;

    act(() => {
      inputText(input, '我的 iPhone');
    });
    const installButton = buttonByText(container, 'shortcutBookkeeping.createAndInstall');
    expect(installButton).toBeDefined();
    expect(installButton?.disabled).toBe(false);
    expect(container.querySelector<HTMLDetailsElement>('details')?.open).toBe(false);
    act(() => installButton?.click());

    await vi.waitFor(() => {
      expect(mocks.issue).toHaveBeenCalledOnce();
      expect(mocks.openInstaller).toHaveBeenCalledWith('https://www.icloud.com/shortcuts/template123');
    });
    expect(mocks.writeText).toHaveBeenCalledWith('wws_test-credential');
    expect(mocks.issue).toHaveBeenCalledWith({
      confirmationBaseUrl: window.location.origin,
      name: '我的 iPhone',
    });
  });

  it('keeps the one-time credential visible when copying fails and supports retrying installation', async () => {
    mocks.writeText.mockRejectedValueOnce(new Error('clipboard unavailable'));
    mocks.copyFallback.mockReturnValueOnce(false);
    const container = renderPage();
    const input = container.querySelector<HTMLInputElement>('input')!;

    act(() => inputText(input, '我的 iPhone'));
    act(() => buttonByText(container, 'shortcutBookkeeping.createAndInstall')?.click());

    await vi.waitFor(() => {
      expect(container.textContent).toContain('wws_test-credential');
      expect(mocks.openInstaller).not.toHaveBeenCalled();
    });

    const retryButton = buttonByText(container, 'shortcutBookkeeping.copyAndInstall');
    expect(retryButton).toBeDefined();
    act(() => retryButton?.click());

    await vi.waitFor(() => {
      expect(mocks.openInstaller).toHaveBeenCalledWith('https://www.icloud.com/shortcuts/template123');
    });
  });

  it('does not copy or open the installer when credential creation fails', async () => {
    mocks.issue.mockRejectedValueOnce(new Error('request failed'));
    const container = renderPage();
    const input = container.querySelector<HTMLInputElement>('input')!;

    act(() => inputText(input, '我的 iPhone'));
    act(() => buttonByText(container, 'shortcutBookkeeping.createAndInstall')?.click());

    await vi.waitFor(() => expect(mocks.issue).toHaveBeenCalledOnce());
    expect(mocks.writeText).not.toHaveBeenCalled();
    expect(mocks.copyFallback).not.toHaveBeenCalled();
    expect(mocks.openInstaller).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('wws_test-credential');
  });

  it('falls back to the expanded manual setup when no valid installer is configured', () => {
    mocks.installUrl = undefined;
    const container = renderPage();

    expect(buttonByText(container, 'shortcutBookkeeping.createCredential')).toBeDefined();
    const manualSetup = container.querySelector<HTMLDetailsElement>('details');
    expect(manualSetup).not.toBeNull();
    expect(manualSetup?.open).toBe(true);
    expect(manualSetup?.textContent).toContain('shortcutBookkeeping.manualSetup');
  });

  it('copies the request endpoint from the manual setup', async () => {
    mocks.installUrl = undefined;
    const container = renderPage();

    act(() => buttonByText(container, 'shortcutBookkeeping.copyEndpoint')?.click());

    await vi.waitFor(() => {
      expect(mocks.writeText).toHaveBeenCalledWith(`${window.location.origin}/api/shortcut-drafts`);
    });
  });

  it('revokes an active shortcut credential after confirmation', async () => {
    mocks.tokens = [{
      confirmationBaseUrl: 'https://bill.example',
      createdAt: '2026-08-29T00:00:00.000Z',
      expiresAt: '2027-08-29T00:00:00.000Z',
      id: 'token-1',
      name: '我的 iPhone',
      tokenPrefix: 'wws_abcd',
    }];
    const container = renderPage();

    act(() => buttonByText(container, 'shortcutBookkeeping.revoke')?.click());

    await vi.waitFor(() => {
      expect(mocks.confirmAction).toHaveBeenCalledOnce();
      expect(mocks.revoke).toHaveBeenCalledWith('token-1');
    });
  });
});
