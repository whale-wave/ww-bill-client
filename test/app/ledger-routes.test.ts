import type { RouteObject } from 'react-router-dom';
import { matchRoutes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@/app/router';

const routerCapture = vi.hoisted(() => {
  const state: { routes: unknown[] } = { routes: [] };
  return {
    createHashRouter: vi.fn((routes: unknown[]) => {
      state.routes = routes;
      return { routes };
    }),
    state,
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    createHashRouter: routerCapture.createHashRouter,
  };
});

function getMatchedLeaf(pathname: string) {
  const matches = matchRoutes(routerCapture.state.routes as RouteObject[], pathname);
  return matches?.at(-1)?.route;
}

describe('ledger page routes', () => {
  it.each([
    ['/ledgers', undefined],
    ['/ledgers/templates', 'templates'],
    ['/ledgers/create', 'create'],
    ['/ledgers/join', 'join'],
    ['/ledgers/applications', 'applications'],
    ['/ledger-invites/AB%2FC', 'ledger-invites/:code'],
    ['/ledgers/ledger%2Fa', ':ledgerId'],
    ['/ledgers/ledger%2Fa/records', ':ledgerId/records'],
    ['/ledgers/ledger%2Fa/budget', ':ledgerId/budget'],
    ['/ledgers/ledger%2Fa/charts', ':ledgerId/charts'],
    ['/ledgers/ledger%2Fa/settings', ':ledgerId/settings'],
    ['/ledgers/ledger%2Fa/settings/categories', ':ledgerId/settings/categories'],
    ['/ledgers/ledger%2Fa/settings/tags', ':ledgerId/settings/tags'],
    ['/ledgers/ledger%2Fa/recovery', ':ledgerId/recovery'],
    ['/ledgers/ledger%2Fa/transfer', ':ledgerId/transfer'],
    ['/ledgers/ledger%2Fa/export', ':ledgerId/export'],
    ['/ledgers/ledger%2Fa/invites', ':ledgerId/invites'],
    ['/ledgers/ledger%2Fa/members', ':ledgerId/members'],
    ['/ledgers/ledger%2Fa/members/member%2Fb', ':ledgerId/members/:memberId'],
    ['/ledgers/ledger%2Fa/join-requests', ':ledgerId/join-requests'],
    [
      '/ledgers/ledger%2Fa/join-requests/request%2Fb',
      ':ledgerId/join-requests/:requestId',
    ],
  ])('registers the protected lazy page for %s', (pathname, expectedPath) => {
    const route = getMatchedLeaf(pathname);

    expect(route).toBeDefined();
    expect(route?.path).toBe(expectedPath);
    expect(route?.lazy).toBeTypeOf('function');
  });
});
