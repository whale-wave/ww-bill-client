import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MinePage from '@/pages/mine/MinePage';

vi.mock('@/entities/user', () => ({
  UserSummaryCard: () => createElement('div'),
  useGetUserUserInfoQuery: () => ({ data: undefined }),
}));

vi.mock('@/pages/mine/ui', () => ({
  BottomList: () => createElement('div'),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/play-sound', () => ({
  playSound: { turnPage: vi.fn() },
}));

vi.mock('@/shared/ui', () => ({
  ActionMenuCard: ({ items }: { items: Array<{ key: string; label: string; onClick: () => void }> }) => (
    createElement('div', null, items.map(item => createElement(
      'button',
      { key: item.key, onClick: item.onClick, type: 'button' },
      item.label,
    )))
  ),
  DesignIcon: () => createElement('span'),
}));

vi.mock('@/widgets/layout', () => ({
  TabBar: () => createElement('div'),
}));

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('mine invite friends entry', () => {
  it('opens the invite poster page instead of showing coming soon', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([
      { path: '/mine', element: createElement(MinePage) },
      { path: '/invite-friends', element: createElement('div', null, 'invite-target') },
    ], { initialEntries: ['/mine'] });
    act(() => root.render(createElement(RouterProvider, { router })));
    cleanup = () => act(() => root.unmount());

    const inviteButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'tabs.inviteFriends');
    expect(inviteButton).toBeDefined();
    await act(async () => inviteButton?.click());

    expect(router.state.location.pathname).toBe('/invite-friends');
  });
});
