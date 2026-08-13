import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BottomList from '@/pages/mine/ui/BottomList/BottomList';

const runtimeConfig = vi.hoisted(() => ({ isDev: true }));

vi.mock('@/shared/config', () => ({
  default: runtimeConfig,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('antd-mobile', () => {
  const List = ({ children }: { children: ReactNode }) => createElement('div', null, children);
  List.Item = ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => createElement('button', { onClick, type: 'button' }, children);

  return {
    List,
    Toast: { show: vi.fn() },
  };
});

let cleanup: (() => void) | undefined;

function renderBottomList(routes: RouteObject[] = []) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/mine', element: createElement(BottomList) },
    ...routes,
  ], { initialEntries: ['/mine'] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());

  return { container, router };
}

beforeEach(() => {
  runtimeConfig.isDev = true;
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('mine ledger entries', () => {
  it('opens the ledger center from the mine list', async () => {
    const { container, router } = renderBottomList([
      { path: '/ledgers', element: createElement('div', null, 'ledger-center-target') },
    ]);

    const entry = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'ledger:center.title');
    expect(entry).toBeDefined();
    await act(async () => entry?.click());

    expect(router.state.location.pathname).toBe('/ledgers');
  });

  it('opens the household status router from the mine list', async () => {
    const { container, router } = renderBottomList([
      { path: '/household', element: createElement('div', null, 'household-target') },
    ]);

    const entry = [...container.querySelectorAll('button')]
      .find(button => button.textContent === 'household:common.title');
    expect(entry).toBeDefined();
    await act(async () => entry?.click());

    expect(router.state.location.pathname).toBe('/household');
  });

  it('hides ledger configuration entries outside development mode', () => {
    runtimeConfig.isDev = false;
    const { container } = renderBottomList();

    const entries = [...container.querySelectorAll('button')]
      .map(button => button.textContent);

    expect(entries).not.toContain('ledger:center.title');
    expect(entries).not.toContain('household:common.title');
    expect(entries).toContain('bottomList.settings');
  });
});
