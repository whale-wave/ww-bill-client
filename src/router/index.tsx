import type { ComponentType, FC } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/features/auth';
import { RootLayout } from '@/widgets/layout';

/**
 * Wrap a page component with LoginGuard. The wrapper is created once per
 * route (lazy resolves once and React Router caches the result), so the
 * component identity is stable across renders.
 */
function withGuard(Comp: ComponentType): ComponentType {
  return function GuardedRoute() {
    return <LoginGuard><Comp /></LoginGuard>;
  };
}

/**
 * Lazy route helper — no Suspense boundary. React Router keeps the current
 * page mounted while the chunk loads, so there's no flash/fallback. This is
 * the "native app" navigation feel.
 */
function lazyPage(loader: () => Promise<{ default: ComponentType }>) {
  return () => loader().then(m => ({ Component: m.default }));
}

/** Same as lazyPage but wraps the component in LoginGuard. */
function lazyGuardedPage(loader: () => Promise<{ default: ComponentType }>) {
  return () => loader().then(m => ({ Component: withGuard(m.default) }));
}

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/pages/first-screen')),
      },
      {
        path: 'budget',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/budget')),
          },
          {
            path: 'category/:type',
            lazy: lazyGuardedPage(() => import('@/pages/create-budget-category')),
          },
        ],
      },
      {
        path: 'record-calendar',
        lazy: lazyGuardedPage(() => import('@/pages/record-calendar')),
      },
      {
        path: 'search-record',
        lazy: lazyGuardedPage(() => import('@/pages/search-record')),
      },
      {
        path: 'invoice',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/invoice')),
          },
          {
            path: ':id',
            lazy: lazyGuardedPage(() => import('@/pages/invoice/InvoiceDetail')),
          },
          {
            path: ':id/edit',
            lazy: lazyGuardedPage(() => import('@/pages/invoice/InvoiceEdit')),
          },
          {
            path: 'create',
            lazy: lazyGuardedPage(() => import('@/pages/invoice/InvoiceCreate')),
          },
        ],
      },
      {
        path: 'bookkeeping',
        lazy: lazyPage(() => import('@/pages/bookkeeping')),
      },
      {
        path: 'discovery',
        lazy: lazyPage(() => import('@/pages/discovery')),
      },
      {
        path: 'community',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/community')),
          },
          {
            path: 'personal/:id',
            lazy: lazyGuardedPage(() => import('@/pages/community/Personal')),
          },
          {
            path: 'follow-list/:id/:type',
            lazy: lazyGuardedPage(() => import('@/pages/community/FollowList')),
          },
        ],
      },
      {
        path: 'category',
        caseSensitive: true,
        lazy: lazyGuardedPage(() => import('@/pages/bookkeeping/CategorySettings')),
      },
      {
        path: 'cateGory',
        caseSensitive: true,
        element: <Navigate to="/category" replace />,
      },
      {
        path: 'editing/:id',
        lazy: lazyPage(() => import('@/pages/detail-editing')),
      },
      {
        path: 'user-info',
        lazy: lazyGuardedPage(() => import('@/pages/user-info')),
      },
      {
        path: 'password',
        lazy: lazyGuardedPage(() => import('@/pages/password')),
      },
      {
        path: 'forget-password',
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('@/pages/forget-password/ForgetPassword')),
          },
          {
            path: 'verify-code',
            lazy: lazyPage(() => import('@/pages/forget-password/ForgetPasswordVerifyCode')),
          },
          {
            path: 'reset',
            lazy: lazyPage(() => import('@/pages/forget-password/ForgetPasswordReset')),
          },
        ],
      },
      {
        path: 'sign',
        lazy: lazyPage(() => import('@/pages/sign')),
      },
      {
        path: 'chart',
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('@/pages/chart/ChartHome/ChartHome')),
          },
          {
            path: 'category',
            lazy: lazyPage(() => import('@/pages/chart/ChartCategory/ChartCategory')),
          },
        ],
      },
      {
        path: 'mine',
        lazy: lazyGuardedPage(() => import('@/pages/mine')),
      },
      {
        path: 'share',
        lazy: lazyGuardedPage(() => import('@/pages/share')),
      },
      {
        path: 'post-topic',
        lazy: lazyGuardedPage(() => import('@/pages/post-topic')),
      },
      {
        path: 'topic-detail/:id',
        lazy: lazyGuardedPage(() => import('@/pages/topic-detail')),
      },
      {
        path: 'login',
        lazy: lazyPage(() => import('@/pages/login')),
      },
      {
        path: 'detail',
        lazy: lazyPage(() => import('@/pages/detail')),
      },
      {
        path: 'message',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/message')),
          },
          {
            path: 'new-follow',
            lazy: lazyGuardedPage(() => import('@/pages/new-follow')),
          },
          {
            path: 'comment-list',
            lazy: lazyGuardedPage(() => import('@/pages/comment-list')),
          },
          {
            path: 'system-notify',
            lazy: lazyGuardedPage(() => import('@/pages/system-notify')),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/settings')),
          },
          {
            path: 'email',
            children: [
              {
                path: 'change',
                children: [
                  {
                    index: true,
                    lazy: lazyGuardedPage(() => import('@/pages/email-change')),
                  },
                  {
                    path: 'captcha',
                    lazy: lazyGuardedPage(() => import('@/pages/email-change/EmailChangeCaptcha')),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'export-data',
        lazy: lazyGuardedPage(() => import('@/pages/export-data')),
      },
      {
        path: 'bill',
        lazy: lazyGuardedPage(() => import('@/pages/bill')),
      },
      {
        path: 'asset',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/asset/AssetManager/AssetManager')),
          },
          {
            path: 'add-form/:id?',
            lazy: lazyGuardedPage(() => import('@/pages/asset/AssetFormInfo/AssetFormInfo')),
          },
          {
            path: 'add-account',
            lazy: lazyGuardedPage(() => import('@/pages/asset/AddAssetAccount/AddAssetAccount')),
          },
          {
            path: 'detail/:id',
            lazy: lazyGuardedPage(() => import('@/pages/asset/AssetDetail/AssetDetail')),
          },
          {
            path: 'chart',
            lazy: lazyGuardedPage(() => import('@/pages/asset/AssetChart/AssetChart')),
          },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expenses')),
          },
          {
            path: 'create',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expenses/FixedExpenseCreate')),
          },
          {
            path: ':id',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expenses/FixedExpenseDetail')),
          },
          {
            path: ':id/edit',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expenses/FixedExpenseEdit')),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: lazyPage(() => import('@/pages/not-found')),
  },
]);

export const Router: FC = () => {
  return <RouterProvider router={router} />;
};
