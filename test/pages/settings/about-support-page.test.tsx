import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AboutSupportPage from '@/pages/about-support/AboutSupportPage';

const mocks = vi.hoisted(() => ({
  saveImageToGallery: vi.fn(),
  toastShow: vi.fn(),
}));

vi.mock('@capacitor/app', () => ({
  App: { getInfo: vi.fn() },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'ios' },
}));

vi.mock('antd-mobile', () => ({
  Toast: { show: mocks.toastShow },
}));

vi.mock('@/entities/app-release', () => ({
  isAndroidClientUpdateAvailable: vi.fn(),
  useClientLatestReleaseQuery: () => ({
    data: undefined,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/workspace-navigation', () => ({
  useWorkspaceBack: () => vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib', () => ({
  openExternalUrl: vi.fn(),
  saveImageToGallery: mocks.saveImageToGallery,
}));

vi.mock('@/shared/ui', () => ({
  AppButton: ({ children, fullWidth: _fullWidth, loading: _loading, loadingLabel: _loadingLabel, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean; loading?: boolean; loadingLabel?: ReactNode }) => createElement('button', props, children),
  AppModal: ({ content, visible }: { content: ReactNode; visible: boolean }) => visible
    ? content
    : null,
  PageHeader: ({ title }: { title: ReactNode }) => createElement('header', null, title),
  Surface: ({ children, material: _material, ...props }: { children: ReactNode; material: string }) => createElement('div', props, children),
}));

let cleanup = () => {};

function renderPage() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(AboutSupportPage) as ReactElement));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

beforeEach(() => {
  mocks.saveImageToGallery.mockReset();
  mocks.toastShow.mockReset();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    blob: () => Promise.resolve(new Blob(['qr'], { type: 'image/png' })),
    ok: true,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('aboutSupportPage sponsor entry', () => {
  it('opens the website sponsor QR code from the support row', async () => {
    const container = renderPage();

    const sponsorEntry = container.querySelector<HTMLButtonElement>('[data-about-row="sponsor"]');
    expect(sponsorEntry?.textContent).toContain('aboutSupport.sponsor');

    sponsorEntry?.focus();
    await act(async () => sponsorEntry?.click());

    const dialog = container.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('sponsor-modal-title');
    expect(document.activeElement).toBe(dialog);
    expect(container.querySelector('[role="dialog"] img')?.getAttribute('alt')).toBe('aboutSupport.sponsorQrAlt');

    await act(async () => dialog?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(sponsorEntry);
  });

  it('saves the sponsor QR code through the existing image export flow', async () => {
    mocks.saveImageToGallery.mockResolvedValue({ destination: 'downloaded' });
    const container = renderPage();

    await act(async () => container.querySelector<HTMLButtonElement>('[data-about-row="sponsor"]')?.click());
    const saveButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'aboutSupport.saveSponsorQr');
    await act(async () => saveButton?.click());

    expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.saveImageToGallery).toHaveBeenCalledWith(expect.any(Blob), '鲸浪记账-支付宝赞助二维码.png');
    expect(mocks.toastShow).toHaveBeenCalledWith({ content: 'aboutSupport.sponsorQrSaved', icon: 'success' });
  });
});
