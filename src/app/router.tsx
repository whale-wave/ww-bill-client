import type { ComponentType, FC } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/features/auth';
import { registerRoutePrefetchers } from '@/shared/lib';
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

const tabRouteLoaders = {
  'ledger-charts': () => import('@/pages/ledger-charts/LedgerChartsPage'),
  'ledger-create': () => import('@/pages/ledger-record-create/LedgerRecordCreatePage'),
  'ledger-records': () => import('@/pages/ledger-records/LedgerRecordsPage'),
  'personal-bookkeeping': () => import('@/pages/record/bookkeeping/BookkeepingPage'),
  'personal-chart': () => import('@/pages/chart/chart-home/ChartHomePage'),
  'personal-detail': () => import('@/pages/record/detail/DetailPage'),
  'personal-discovery': () => import('@/pages/discovery/DiscoveryPage'),
  'personal-mine': () => import('@/pages/mine/MinePage'),
};

registerRoutePrefetchers(tabRouteLoaders);

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
        lazy: lazyPage(tabRouteLoaders['personal-bookkeeping']),
      },
      {
        path: 'discovery',
        lazy: lazyPage(tabRouteLoaders['personal-discovery']),
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
        lazy: lazyGuardedPage(() => import('@/pages/record/editing/EditingPage')),
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
            lazy: lazyPage(tabRouteLoaders['personal-chart']),
          },
          {
            path: 'category',
            lazy: lazyPage(() => import('@/pages/chart/chart-category/ChartCategoryPage')),
          },
        ],
      },
      {
        path: 'mine',
        lazy: lazyGuardedPage(tabRouteLoaders['personal-mine']),
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
        lazy: lazyPage(tabRouteLoaders['personal-detail']),
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
            path: 'app-lock',
            lazy: lazyGuardedPage(() => import('@/pages/app-lock-settings/AppLockSettingsPage')),
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
        path: 'feedback',
        lazy: lazyGuardedPage(() => import('@/pages/feedback/FeedbackPage')),
      },
      {
        path: 'bill',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/bill/BillPage')),
          },
          {
            path: ':month',
            lazy: lazyGuardedPage(() => import('@/pages/bill/month-detail/MonthBillDetailPage')),
          },
        ],
      },
      {
        path: 'household',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/household-entry/HouseholdEntryPage')),
          },
          {
            path: 'create',
            lazy: lazyGuardedPage(() => import('@/pages/household-create/HouseholdCreatePage')),
          },
          {
            path: 'join',
            lazy: lazyGuardedPage(() => import('@/pages/household-join/HouseholdJoinPage')),
          },
        ],
      },
      {
        path: 'household-invitations/:code',
        lazy: lazyGuardedPage(() => import('@/pages/household-invitation-preview/HouseholdInvitationPreviewPage')),
      },
      {
        path: 'households',
        children: [
          {
            path: ':householdId/invitation',
            lazy: lazyGuardedPage(() => import('@/pages/household-invitation/HouseholdInvitationPage')),
          },
          {
            path: ':householdId/records/search',
            lazy: lazyGuardedPage(() => import('@/pages/household-record-search/HouseholdRecordSearchPage')),
          },
          {
            path: ':householdId/records/:recordId/policy',
            lazy: lazyGuardedPage(() => import('@/pages/household-record-policy/HouseholdRecordPolicyPage')),
          },
          {
            path: ':householdId/records/:recordId',
            lazy: lazyGuardedPage(() => import('@/pages/household-record-detail/HouseholdRecordDetailPage')),
          },
          {
            path: ':householdId/records',
            lazy: lazyGuardedPage(() => import('@/pages/household-home/HouseholdHomePage')),
          },
          {
            path: ':householdId/calendar',
            lazy: lazyGuardedPage(() => import('@/pages/household-calendar/HouseholdCalendarPage')),
          },
          {
            path: ':householdId/records/bill',
            lazy: lazyGuardedPage(() => import('@/pages/bill/HouseholdBillPage')),
          },
          {
            path: ':householdId/budgets',
            lazy: lazyGuardedPage(() => import('@/pages/household-budgets/HouseholdBudgetsPage')),
          },
          {
            path: ':householdId/charts',
            lazy: lazyGuardedPage(() => import('@/pages/household-charts/HouseholdChartsPage')),
          },
          {
            path: ':householdId/settings',
            lazy: lazyGuardedPage(() => import('@/pages/household-settings/HouseholdSettingsPage')),
          },
          {
            path: ':householdId/export',
            lazy: lazyGuardedPage(() => import('@/pages/household-export/HouseholdExportPage')),
          },
          {
            path: ':householdId/members',
            lazy: lazyGuardedPage(() => import('@/pages/household-members/HouseholdMembersPage')),
          },
          {
            path: ':householdId',
            lazy: lazyGuardedPage(() => import('@/pages/household-home/HouseholdHomePage')),
          },
        ],
      },
      {
        path: 'ledgers',
        children: [
          {
            index: true,
            lazy: lazyGuardedPage(() => import('@/pages/ledger-center/LedgerCenterPage')),
          },
          {
            path: 'templates',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-templates/LedgerTemplatesPage')),
          },
          {
            path: 'create',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-create/LedgerCreatePage')),
          },
          {
            path: 'join',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-join/LedgerJoinPage')),
          },
          {
            path: 'applications',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-applications/LedgerApplicationsPage')),
          },
          {
            path: 'preferences',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-preferences/LedgerPreferencesPage')),
          },
          {
            path: 'management',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-center/LedgerCenterPage')),
          },
          {
            path: ':ledgerId/records/search',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-record-search/LedgerRecordSearchPage')),
          },
          {
            path: ':ledgerId/records/new',
            lazy: lazyGuardedPage(tabRouteLoaders['ledger-create']),
          },
          {
            path: ':ledgerId/records/:recordId/edit',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-record-edit/LedgerRecordEditPage')),
          },
          {
            path: ':ledgerId/records/:recordId',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-record-detail/LedgerRecordDetailPage')),
          },
          {
            path: ':ledgerId/records',
            lazy: lazyGuardedPage(tabRouteLoaders['ledger-records']),
          },
          {
            path: ':ledgerId/calendar',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-calendar/LedgerCalendarPage')),
          },
          {
            path: ':ledgerId/bill',
            lazy: lazyGuardedPage(() => import('@/pages/bill/LedgerBillPage')),
          },
          {
            path: ':ledgerId/budget',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-budget/LedgerBudgetPage')),
          },
          {
            path: ':ledgerId/charts',
            lazy: lazyGuardedPage(tabRouteLoaders['ledger-charts']),
          },
          {
            path: ':ledgerId/settings/categories',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-categories/LedgerCategoriesPage')),
          },
          {
            path: ':ledgerId/settings/tags',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-tags/LedgerTagsPage')),
          },
          {
            path: ':ledgerId/settings',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-settings/LedgerSettingsPage')),
          },
          {
            path: ':ledgerId/recovery',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-recovery/LedgerRecoveryPage')),
          },
          {
            path: ':ledgerId/transfer',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-transfer/LedgerTransferPage')),
          },
          {
            path: ':ledgerId/export',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-export/LedgerExportPage')),
          },
          {
            path: ':ledgerId/invites',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-invite/LedgerInvitePage')),
          },
          {
            path: ':ledgerId/members',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-members/LedgerMembersPage')),
          },
          {
            path: ':ledgerId/members/:memberId',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-member-detail/LedgerMemberDetailPage')),
          },
          {
            path: ':ledgerId/join-requests',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-join-requests/LedgerJoinRequestsPage')),
          },
          {
            path: ':ledgerId/join-requests/:requestId',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-join-request-detail/LedgerJoinRequestDetailPage')),
          },
          {
            path: ':ledgerId',
            lazy: lazyGuardedPage(() => import('@/pages/ledger-detail/LedgerDetailPage')),
          },
        ],
      },
      {
        path: 'ledger-invites/:code',
        lazy: lazyGuardedPage(() => import('@/pages/ledger-invitation-preview/LedgerInvitationPreviewPage')),
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
