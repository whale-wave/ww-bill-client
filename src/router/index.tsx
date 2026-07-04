import type { ComponentType, FC, LazyExoticComponent, ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/features/auth';
import { RootLayout } from '@/widgets/layout';

const AddAssetAccount = lazy(() => import('@/pages/Asset/AddAssetAccount/AddAssetAccount'));
const AssetChart = lazy(() => import('@/pages/Asset/AssetChart/AssetChart'));
const AssetDetail = lazy(() => import('@/pages/Asset/AssetDetail/AssetDetail'));
const AssetFormInfo = lazy(() => import('@/pages/Asset/AssetFormInfo/AssetFormInfo'));
const AssetManager = lazy(() => import('@/pages/Asset/AssetManager/AssetManager'));
const Bill = lazy(() => import('@/pages/Bill'));
const Bookkeeping = lazy(() => import('@/pages/bookkeeping'));
const CategorySettings = lazy(() => import('@/pages/bookkeeping/CategorySettings'));
const Budget = lazy(() => import('@/pages/Budget'));
const ChartCategory = lazy(() => import('@/pages/Chart/ChartCategory/ChartCategory'));
const ChartHome = lazy(() => import('@/pages/Chart/ChartHome/ChartHome'));
const CommentList = lazy(() => import('@/pages/comment-list'));
const Community = lazy(() => import('@/pages/community'));
const FollowList = lazy(() => import('@/pages/community/FollowList'));
const Personal = lazy(() => import('@/pages/community/Personal'));
const CreateBudgetCategory = lazy(() => import('@/pages/CreateBudgetCategory'));
const Detail = lazy(() => import('@/pages/detail'));
const Editing = lazy(() => import('@/pages/Detail_editing'));
const Discovery = lazy(() => import('@/pages/Discovery'));
const EmailChange = lazy(() => import('@/pages/EmailChange'));
const EmailChangeCaptcha = lazy(() => import('@/pages/EmailChange/EmailChangeCaptcha'));
const ExportData = lazy(() => import('@/pages/export-data'));
const FirstScreen = lazy(() => import('@/pages/FirstScreen'));
const FixedExpenses = lazy(() => import('@/pages/FixedExpenses'));
const FixedExpenseCreate = lazy(() => import('@/pages/FixedExpenses/FixedExpenseCreate'));
const FixedExpenseDetail = lazy(() => import('@/pages/FixedExpenses/FixedExpenseDetail'));
const FixedExpenseEdit = lazy(() => import('@/pages/FixedExpenses/FixedExpenseEdit'));
const ForgetPassword = lazy(() => import('@/pages/ForgetPassword/ForgetPassword'));
const ForgetPasswordReset = lazy(() => import('@/pages/ForgetPassword/ForgetPasswordReset'));
const ForgetPasswordVerifyCode = lazy(() => import('@/pages/ForgetPassword/ForgetPasswordVerifyCode'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));
const InvoiceDetail = lazy(() => import('@/pages/Invoice/InvoiceDetail'));
const InvoiceEdit = lazy(() => import('@/pages/Invoice/InvoiceEdit'));
const Login = lazy(() => import('@/pages/Login'));
const Message = lazy(() => import('@/pages/Message'));
const Mine = lazy(() => import('@/pages/mine'));
const NewFollow = lazy(() => import('@/pages/new-follow'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Password = lazy(() => import('@/pages/Password'));
const PostTopic = lazy(() => import('@/pages/PostTopic'));
const RecordCalendar = lazy(() => import('@/pages/RecordCalendar'));
const SearchRecord = lazy(() => import('@/pages/SearchRecord'));
const Settings = lazy(() => import('@/pages/settings'));
const Share = lazy(() => import('@/pages/Share'));
const Sign = lazy(() => import('@/pages/Sign'));
const SystemNotify = lazy(() => import('@/pages/system-notify'));
const TopicDetail = lazy(() => import('@/pages/TopicDetail'));
const UserInfo = lazy(() => import('@/pages/UserInfo'));

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
