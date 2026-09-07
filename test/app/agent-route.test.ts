import type { RouteObject } from 'react-router-dom';
import { matchRoutes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ROUTES_PATH } from '@/shared/config/routes';

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
  return { ...actual, createHashRouter: routerCapture.createHashRouter };
});

describe('agent route', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('registers the guarded lazy conversation page in development', async () => {
    vi.stubEnv('DEV', true);
    await import('@/app/router');
    const matches = matchRoutes(routerCapture.state.routes as RouteObject[], ROUTES_PATH.AGENT.getPath());
    const route = matches?.at(-1)?.route;

    expect(route?.path).toBe('agent');
    expect(route?.lazy).toBeTypeOf('function');
  });

  it('does not register the conversation page in production', async () => {
    vi.stubEnv('DEV', false);
    await import('@/app/router');
    const matches = matchRoutes(routerCapture.state.routes as RouteObject[], ROUTES_PATH.AGENT.getPath());

    expect(matches?.some(match => match.route.path === 'agent') ?? false).toBe(false);
  });
});
