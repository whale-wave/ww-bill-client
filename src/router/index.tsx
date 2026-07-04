import type { ComponentType, FC, LazyExoticComponent, ReactElement } from 'react';
import { Suspense } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/features/auth';
import { RootLayout } from '@/widgets/layout';
import {
  AddAssetAccount,
  AssetChart,
  AssetDetail,
  AssetFormInfo,
  AssetManager,
  Bill,
  Bookkeeping,
  Budget,
  CategorySettings,
  ChartCategory,
  ChartHome,
  CommentList,
  Community,
  CreateBudgetCategory,
  Detail,
  Discovery,
  Editing,
  EmailChange,
  EmailChangeCaptcha,
  ExportData,
  FirstScreen,
  FixedExpenseCreate,
  FixedExpenseDetail,
  FixedExpenseEdit,
  FixedExpenses,
  FollowList,
  ForgetPassword,
  ForgetPasswordReset,
  ForgetPasswordVerifyCode,
  Invoice,
  InvoiceCreate,
  InvoiceDetail,
  InvoiceEdit,
  Login,
  Message,
  Mine,
  NewFollow,
  NotFound,
  Password,
  Personal,
  PostTopic,
  RecordCalendar,
  SearchRecord,
  Settings,
  Share,
  Sign,
  SystemNotify,
  TopicDetail,
  UserInfo,
} from './lazy-pages';

function withSuspense(Component: LazyExoticComponent<ComponentType>): ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}

function withLoginGuard(element: ReactElement): ReactElement {
  return <LoginGuard>{element}</LoginGuard>;
}

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: withSuspense(FirstScreen),
      },
      {
        path: 'budget',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(Budget)),
          },
          {
            path: 'category/:type',
            element: withLoginGuard(withSuspense(CreateBudgetCategory)),
          },
        ],
      },
      {
        path: 'record-calendar',
        element: withLoginGuard(withSuspense(RecordCalendar)),
      },
      {
        path: 'search-record',
        element: withLoginGuard(withSuspense(SearchRecord)),
      },
      {
        path: 'invoice',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(Invoice)),
          },
          {
            path: ':id',
            element: withLoginGuard(withSuspense(InvoiceDetail)),
          },
          {
            path: ':id/edit',
            element: withLoginGuard(withSuspense(InvoiceEdit)),
          },
          {
            path: 'create',
            element: withLoginGuard(withSuspense(InvoiceCreate)),
          },
        ],
      },
      {
        path: 'bookkeeping',
        element: withSuspense(Bookkeeping),
      },
      {
        path: 'discovery',
        element: withSuspense(Discovery),
      },
      {
        path: 'community',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(Community)),
          },
          {
            path: 'personal/:id',
            element: withLoginGuard(withSuspense(Personal)),
          },
          {
            path: 'follow-list/:id/:type',
            element: withLoginGuard(withSuspense(FollowList)),
          },
        ],
      },
      {
        path: 'category',
        caseSensitive: true,
        element: withLoginGuard(withSuspense(CategorySettings)),
      },
      {
        path: 'cateGory',
        caseSensitive: true,
        element: <Navigate to="/category" replace />,
      },
      {
        path: 'editing/:id',
        element: withSuspense(Editing),
      },
      {
        path: 'user-info',
        element: withLoginGuard(withSuspense(UserInfo)),
      },
      {
        path: 'password',
        element: withLoginGuard(withSuspense(Password)),
      },
      {
        path: 'forget-password',
        children: [
          {
            index: true,
            element: withSuspense(ForgetPassword),
          },
          {
            path: 'verify-code',
            element: withSuspense(ForgetPasswordVerifyCode),
          },
          {
            path: 'reset',
            element: withSuspense(ForgetPasswordReset),
          },
        ],
      },
      {
        path: 'sign',
        element: withSuspense(Sign),
      },
      {
        path: 'chart',
        children: [
          {
            index: true,
            element: withSuspense(ChartHome),
          },
          {
            path: 'category',
            element: withSuspense(ChartCategory),
          },
        ],
      },
      {
        path: 'mine',
        element: withLoginGuard(withSuspense(Mine)),
      },
      {
        path: 'share',
        element: withLoginGuard(withSuspense(Share)),
      },
      {
        path: 'post-topic',
        element: withLoginGuard(withSuspense(PostTopic)),
      },
      {
        path: 'topic-detail/:id',
        element: withLoginGuard(withSuspense(TopicDetail)),
      },
      {
        path: 'login',
        element: withSuspense(Login),
      },
      {
        path: 'detail',
        element: withSuspense(Detail),
      },
      {
        path: 'message',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(Message)),
          },
          {
            path: 'new-follow',
            element: withLoginGuard(withSuspense(NewFollow)),
          },
          {
            path: 'comment-list',
            element: withLoginGuard(withSuspense(CommentList)),
          },
          {
            path: 'system-notify',
            element: withLoginGuard(withSuspense(SystemNotify)),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(Settings)),
          },
          {
            path: 'email',
            children: [
              {
                path: 'change',
                children: [
                  {
                    index: true,
                    element: withLoginGuard(withSuspense(EmailChange)),
                  },
                  {
                    path: 'captcha',
                    element: withLoginGuard(withSuspense(EmailChangeCaptcha)),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'export-data',
        element: withLoginGuard(withSuspense(ExportData)),
      },
      {
        path: 'bill',
        element: withLoginGuard(withSuspense(Bill)),
      },
      {
        path: 'asset',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(AssetManager)),
          },
          {
            path: 'add-form/:id?',
            element: withLoginGuard(withSuspense(AssetFormInfo)),
          },
          {
            path: 'add-account',
            element: withLoginGuard(withSuspense(AddAssetAccount)),
          },
          {
            path: 'detail/:id',
            element: withLoginGuard(withSuspense(AssetDetail)),
          },
          {
            path: 'chart',
            element: withLoginGuard(withSuspense(AssetChart)),
          },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          {
            index: true,
            element: withLoginGuard(withSuspense(FixedExpenses)),
          },
          {
            path: 'create',
            element: withLoginGuard(withSuspense(FixedExpenseCreate)),
          },
          {
            path: ':id',
            element: withLoginGuard(withSuspense(FixedExpenseDetail)),
          },
          {
            path: ':id/edit',
            element: withLoginGuard(withSuspense(FixedExpenseEdit)),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(NotFound),
  },
]);

export const Router: FC = () => {
  return <RouterProvider router={router} />;
};
