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
  return matchRoutes(routerCapture.state.routes as RouteObject[], pathname)?.at(-1)?.route;
}

describe('household page routes', () => {
  it.each([
    ['/household', undefined],
    ['/household/create', 'create'],
    ['/household/join', 'join'],
    ['/household-invitations/AB%2FC', 'household-invitations/:code'],
    ['/households/household%2Fa', ':householdId'],
    ['/households/household%2Fa/invitation', ':householdId/invitation'],
    ['/households/household%2Fa/records', ':householdId/records'],
    ['/households/household%2Fa/records/search', ':householdId/records/search'],
    ['/households/household%2Fa/records/7/policy', ':householdId/records/:recordId/policy'],
    ['/households/household%2Fa/calendar', ':householdId/calendar'],
    ['/households/household%2Fa/budgets', ':householdId/budgets'],
    ['/households/household%2Fa/charts', ':householdId/charts'],
    ['/households/household%2Fa/settings', ':householdId/settings'],
    ['/households/household%2Fa/export', ':householdId/export'],
    ['/households/household%2Fa/members', ':householdId/members'],
  ])('registers the protected lazy page for %s', (pathname, expectedPath) => {
    const route = getMatchedLeaf(pathname);

    expect(route).toBeDefined();
    expect(route?.path).toBe(expectedPath);
    expect(route?.lazy).toBeTypeOf('function');
  });
});
