import type { ShortcutAccessTokenSummary } from '@/entities/shortcut-bookkeeping';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShortcutBookkeepingSettingsPage from '@/pages/shortcut-bookkeeping-settings/ShortcutBookkeepingSettingsPage';

const mocks = vi.hoisted(() => ({
  confirmAction: vi.fn(async () => true),
  copyFallback: vi.fn(() => true),
  installUrl: 'https://www.icloud.com/shortcuts/template123' as
  | string
  | undefined,
  issue: vi.fn(),
  openInstaller: vi.fn(),
  revoke: vi.fn(),
  tokens: [] as ShortcutAccessTokenSummary[],
  writeText: vi.fn(),
}));

vi.mock('copy-to-clipboard', () => ({ default: mocks.copyFallback }));
vi.mock('@/entities/shortcut-bookkeeping', () => ({
  useIssueShortcutAccessTokenMutation: () => ({
    isLoading: false,
    mutateAsync: mocks.issue,
  }),
  useRevokeShortcutAccessTokenMutation: () => ({
    isLoading: false,
    mutateAsync: mocks.revoke,
  }),
  useShortcutInstallUrlQuery: () => ({
    data: mocks.installUrl,
    isLoading: false,
  }),
  useShortcutAccessTokensQuery: () => ({
    data: mocks.tokens,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));
vi.mock(
  '@/pages/shortcut-bookkeeping-settings/model',
  async importOriginal => ({
    ...(await importOriginal<
      typeof import('@/pages/shortcut-bookkeeping-settings/model')
    >()),
    getConfiguredIosShortcutInstallUrl: () => mocks.installUrl,
    openIosShortcutInstallUrl: mocks.openInstaller,
  }),
);
vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/ui')>()),
  confirmAppAction: mocks.confirmAction,
}));

let cleanup = () => {};
function renderPage() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() =>
    root.render(
      <MemoryRouter>
        <ShortcutBookkeepingSettingsPage />
      </MemoryRouter>,
    ),
  );
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}
function buttonByText(container: HTMLElement, text: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')].find(
    button => button.textContent === text,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  mocks.installUrl = 'https://www.icloud.com/shortcuts/template123';
  mocks.tokens = [];
  mocks.copyFallback.mockReturnValue(true);
  mocks.issue.mockResolvedValue({ token: 'wws_test-credential' });
  mocks.revoke.mockResolvedValue({});
  mocks.writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: mocks.writeText },
  });
});
afterEach(() => {
  cleanup();
  cleanup = () => {};
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('shortcut bookkeeping settings page', () => {
  it('creates a key without copying or opening the installer', async () => {
    const container = renderPage();
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.intro.start')?.click();
    });
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.createKey.submit')?.click();
    });
    expect(mocks.issue).toHaveBeenCalledWith({
      confirmationBaseUrl: window.location.origin,
      name: 'shortcutBookkeeping.defaultName',
    });
    expect(container.textContent).toContain('wws_te');
    expect(mocks.writeText).not.toHaveBeenCalled();
    expect(mocks.openInstaller).not.toHaveBeenCalled();
  });

  it('shows the install guide immediately after copying, then redirects after five seconds', async () => {
    const container = renderPage();
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.intro.start')?.click();
    });
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.createKey.submit')?.click();
    });
    await act(async () => {
      buttonByText(
        container,
        'shortcutBookkeeping.keyCreated.continue',
      )?.click();
    });
    expect(container.textContent).toContain(
      'shortcutBookkeeping.installGuide.title',
    );
    expect(mocks.openInstaller).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(5100);
    });
    expect(mocks.openInstaller).toHaveBeenCalledOnce();
  });

  it('does not redirect when copying fails', async () => {
    mocks.writeText.mockRejectedValueOnce(new Error('no clipboard'));
    mocks.copyFallback.mockReturnValueOnce(false);
    const container = renderPage();
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.intro.start')?.click();
    });
    await act(async () => {
      buttonByText(container, 'shortcutBookkeeping.createKey.submit')?.click();
    });
    await act(async () => {
      buttonByText(
        container,
        'shortcutBookkeeping.keyCreated.continue',
      )?.click();
    });
    expect(container.textContent).toContain(
      'shortcutBookkeeping.keyCreated.title',
    );
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    expect(mocks.openInstaller).not.toHaveBeenCalled();
  });

  it('shows the configured state regardless of lastUsedAt', () => {
    mocks.tokens = [
      {
        id: 'a',
        name: 'iPhone',
        tokenPrefix: 'wws_a',
        confirmationBaseUrl: 'https://bill.example',
        createdAt: '2026-01-01',
        expiresAt: '2027-01-01',
      },
    ];
    const waiting = renderPage();
    expect(waiting.textContent).toContain(
      'shortcutBookkeeping.overview.connectedTitle',
    );
    cleanup();
    mocks.tokens = [{ ...mocks.tokens[0], lastUsedAt: '2026-01-02' }];
    const connected = renderPage();
    expect(connected.textContent).toContain(
      'shortcutBookkeeping.overview.connectedTitle',
    );
  });

  it('opens the common questions about OCR recognition', () => {
    mocks.tokens = [
      {
        id: 'a',
        name: 'iPhone',
        tokenPrefix: 'wws_a',
        confirmationBaseUrl: 'https://bill.example',
        createdAt: '2026-01-01',
        expiresAt: '2027-01-01',
      },
    ];
    const container = renderPage();
    const faqButton = [
      ...container.querySelectorAll<HTMLButtonElement>('button'),
    ].find(button =>
      button.textContent?.includes('shortcutBookkeeping.overview.faq'),
    );
    act(() => {
      faqButton?.click();
    });
    expect(container.textContent).toContain('shortcutBookkeeping.faq.title');
    expect(container.textContent).toContain(
      'shortcutBookkeeping.faq.items.recognition.question',
    );
  });

  it('renders the usage guide screenshots in the requested 01 to 11 order', () => {
    mocks.tokens = [
      {
        id: 'a',
        name: 'iPhone',
        tokenPrefix: 'wws_a',
        confirmationBaseUrl: 'https://bill.example',
        createdAt: '2026-01-01',
        expiresAt: '2027-01-01',
      },
    ];
    const container = renderPage();
    const usageButton = [
      ...container.querySelectorAll<HTMLButtonElement>('button'),
    ].find(button =>
      button.textContent?.includes('shortcutBookkeeping.overview.usage'),
    );
    act(() => {
      usageButton?.click();
    });
    const images = [...container.querySelectorAll<HTMLImageElement>('img')];
    expect(images).toHaveLength(11);
    expect(container.textContent).toContain(
      'shortcutBookkeeping.usage.sections.find.captions.0',
    );
    expect(container.textContent).toContain(
      'shortcutBookkeeping.usage.sections.backTap.captions.5',
    );
    expect(images[0].src).toContain('01-get-shortcut');
    expect(images[10].src).toContain('11-select-shortcut');
  });

  it('disables setup when no installer is configured', () => {
    mocks.installUrl = undefined;
    const container = renderPage();
    expect(
      buttonByText(container, 'shortcutBookkeeping.intro.start')?.disabled,
    ).toBe(true);
  });
});
