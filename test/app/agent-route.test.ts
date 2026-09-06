import type { RouteObject } from 'react-router-dom';
import { matchRoutes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES_PATH } from '@/shared/config/routes';
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
  return { ...actual, createHashRouter: routerCapture.createHashRouter };
});

describe('agent route', () => {
  it('registers the guarded lazy conversation page', () => {
    const matches = matchRoutes(routerCapture.state.routes as RouteObject[], ROUTES_PATH.AGENT.getPath());
    const route = matches?.at(-1)?.route;

    expect(route?.path).toBe('agent');
    expect(route?.lazy).toBeTypeOf('function');
  });
});
