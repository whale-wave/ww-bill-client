import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UserInfoPage from '@/pages/user/user-info/UserInfoPage';

const mocks = vi.hoisted(() => ({
  logOut: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({
    data: {
      avatar: 'https://example.com/avatar.png',
      email: 'avan@example.com',
      name: 'Avan',
      username: 'avan',
    },
  }),
  usePutUserUserInfoMutation: () => [mocks.updateUser, { isLoading: false }],
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: { logOut: () => void }) => unknown) => selector({ logOut: mocks.logOut }),
}));

vi.mock('@/shared/api', () => ({
  uploadFile: vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/chose-file', () => ({
  default: vi.fn(),
}));

let cleanup: (() => void) | undefined;

function renderPage(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{ element, path: '/settings/user' }], {
    initialEntries: ['/settings/user'],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return container;
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('user info page', () => {
  it('renders the profile avatar as a circle', () => {
    const container = renderPage(createElement(UserInfoPage));
    const avatar = container.querySelector<HTMLImageElement>('img[alt="Avan"]');

    expect(avatar?.parentElement?.classList).toContain('rounded-full');
  });
});
