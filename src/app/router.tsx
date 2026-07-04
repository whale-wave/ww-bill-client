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
        lazy: lazyPage(() => import('@/pages/first-screen/FirstScreenPage')),
      },
      {
        path: 'budget',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/budget/BudgetPage')),
          },
          {
            path: 'category/:type',
            lazy: lazyGuardedPage(() => import('@/pages/create-budget-category/CreateBudgetCategoryPage')),
          },
        ],
      },
      {
        path: 'record-calendar',
        lazy: lazyGuardedPage(() => import('@/pages/record/record-calendar/RecordCalendarPage')),
      },
      {
        path: 'search-record',
        lazy: lazyGuardedPage(() => import('@/pages/record/search-record/SearchRecordPage')),
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
        lazy: lazyPage(() => import('@/pages/record/bookkeeping/BookkeepingPage')),
      },
      {
        path: 'discovery',
        lazy: lazyPage(() => import('@/pages/discovery/DiscoveryPage')),
      },
      {
        path: 'community',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/community/CommunityPage')),
          },
          {
            path: 'personal/:id',
            lazy: lazyGuardedPage(() => import('@/pages/community/PersonalPage')),
          },
          {
            path: 'follow-list/:id/:type',
            lazy: lazyGuardedPage(() => import('@/pages/community/FollowListPage')),
          },
        ],
      },
      {
        path: 'category',
        caseSensitive: true,
        lazy: lazyGuardedPage(() => import('@/pages/category-settings/CategorySettingsPage')),
      },
      {
        path: 'cateGory',
        caseSensitive: true,
        element: <Navigate to="/category" replace />,
      },
      {
        path: 'editing/:id',
        lazy: lazyPage(() => import('@/pages/record/editing/EditingPage')),
      },
      {
        path: 'user-info',
        lazy: lazyGuardedPage(() => import('@/pages/user/user-info/UserInfoPage')),
      },
      {
        path: 'password',
        lazy: lazyGuardedPage(() => import('@/pages/user/password/PasswordPage')),
      },
      {
        path: 'forget-password',
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('@/pages/auth/forget-password/ForgetPasswordPage')),
          },
          {
            path: 'verify-code',
            lazy: lazyPage(() => import('@/pages/auth/forget-password/VerifyCodePage')),
          },
          {
            path: 'reset',
            lazy: lazyPage(() => import('@/pages/auth/forget-password/ResetPage')),
          },
        ],
      },
      {
        path: 'sign',
        lazy: lazyPage(() => import('@/pages/auth/sign/SignPage')),
      },
      {
        path: 'chart',
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('@/pages/chart/chart-home/ChartHomePage')),
          },
          {
            path: 'category',
            lazy: lazyPage(() => import('@/pages/chart/chart-category/ChartCategoryPage')),
          },
        ],
      },
      {
        path: 'mine',
        lazy: lazyGuardedPage(() => import('@/pages/mine/MinePage')),
      },
      {
        path: 'share',
        lazy: lazyGuardedPage(() => import('@/pages/share/SharePage')),
      },
      {
        path: 'post-topic',
        lazy: lazyGuardedPage(() => import('@/pages/post-topic/PostTopicPage')),
      },
      {
        path: 'topic-detail/:id',
        lazy: lazyGuardedPage(() => import('@/pages/topic-detail/TopicDetailPage')),
      },
      {
        path: 'login',
        lazy: lazyPage(() => import('@/pages/auth/login/LoginPage')),
      },
      {
        path: 'detail',
        lazy: lazyPage(() => import('@/pages/record/detail/DetailPage')),
      },
      {
        path: 'message',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/message/MessagePage')),
          },
          {
            path: 'new-follow',
            lazy: lazyGuardedPage(() => import('@/pages/new-follow/NewFollowPage')),
          },
          {
            path: 'comment-list',
            lazy: lazyGuardedPage(() => import('@/pages/comment-list/CommentListPage')),
          },
          {
            path: 'system-notify',
            lazy: lazyGuardedPage(() => import('@/pages/system-notify/SystemNotifyPage')),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/settings/SettingsPage')),
          },
          {
            path: 'email',
            children: [
              {
                path: 'change',
                children: [
                  {
                    index: true,
                    lazy: lazyGuardedPage(() => import('@/pages/user/email-change/EmailChangePage')),
                  },
                  {
                    path: 'captcha',
                    lazy: lazyGuardedPage(() => import('@/pages/user/email-change/EmailChangeCaptchaPage')),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'export-data',
        lazy: lazyGuardedPage(() => import('@/pages/export-data/ExportDataPage')),
      },
      {
        path: 'bill',
        lazy: lazyGuardedPage(() => import('@/pages/bill/BillPage')),
      },
      {
        path: 'asset',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/asset/asset-manager/AssetManagerPage')),
          },
          {
            path: 'add-form/:id?',
            lazy: lazyGuardedPage(() => import('@/pages/asset/asset-form-info/AssetFormInfoPage')),
          },
          {
            path: 'add-account',
            lazy: lazyGuardedPage(() => import('@/pages/asset/add-asset-account/AddAssetAccountPage')),
          },
          {
            path: 'detail/:id',
            lazy: lazyGuardedPage(() => import('@/pages/asset/asset-detail/AssetDetailPage')),
          },
          {
            path: 'chart',
            lazy: lazyGuardedPage(() => import('@/pages/asset/asset-chart/AssetChartPage')),
          },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expense/FixedExpensePage')),
          },
          {
            path: 'create',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expense/FixedExpenseCreatePage')),
          },
          {
            path: ':id',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expense/FixedExpenseDetailPage')),
          },
          {
            path: ':id/edit',
            lazy: lazyGuardedPage(() => import('@/pages/fixed-expense/FixedExpenseEditPage')),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: lazyPage(() => import('@/pages/not-found/NotFoundPage')),
  },
]);

export const Router: FC = () => {
  return <RouterProvider router={router} />;
};
