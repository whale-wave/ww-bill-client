import type { ComponentType, FC, LazyExoticComponent, ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/components';
import { Root } from '@/Root';

const AddAssetAccount = lazy(() => import('@/pages/Asset/AddAssetAccount/AddAssetAccount'));
const AssetChart = lazy(() => import('@/pages/Asset/AssetChart/AssetChart'));
const AssetDetail = lazy(() => import('@/pages/Asset/AssetDetail/AssetDetail'));
const AssetFormInfo = lazy(() => import('@/pages/Asset/AssetFormInfo/AssetFormInfo'));
const AssetManager = lazy(() => import('@/pages/Asset/AssetManager/AssetManager'));
const Bill = lazy(() => import('@/pages/Bill'));
const Bookkeeping = lazy(() => import('@/pages/bookkeeping'));
const CateGory = lazy(() => import('@/pages/bookkeeping/CategorySettings'));
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
const ForgetPasswordRest = lazy(() => import('@/pages/ForgetPassword/ForgetPasswordReset'));
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

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
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
            element: withSuspense(Budget),
          },
          {
            path: 'category/:type',
            element: withSuspense(CreateBudgetCategory),
          },
        ],
      },
      {
        path: 'record-calendar',
        element: withSuspense(RecordCalendar),
      },
      {
        path: 'search-record',
        element: withSuspense(SearchRecord),
      },
      {
        path: 'invoice',
        children: [
          {
            index: true,
            element: withSuspense(Invoice),
          },
          {
            path: ':id',
            element: withSuspense(InvoiceDetail),
          },
          {
            path: ':id/edit',
            element: withSuspense(InvoiceEdit),
          },
          {
            path: 'create',
            element: withSuspense(InvoiceCreate),
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
            element: withSuspense(Community),
          },
          {
            path: 'personal/:id',
            element: withSuspense(Personal),
          },
          {
            path: 'follow-list/:id/:type',
            element: withSuspense(FollowList),
          },
        ],
      },
      {
        path: 'cateGory',
        element: withSuspense(CateGory),
      },
      {
        path: 'editing/:id',
        element: withSuspense(Editing),
      },
      {
        path: 'user-info',
        element: (
          <LoginGuard>
            {withSuspense(UserInfo)}
          </LoginGuard>
        ),
      },
      {
        path: 'password',
        element: (
          <LoginGuard>
            {withSuspense(Password)}
          </LoginGuard>
        ),
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
            element: withSuspense(ForgetPasswordRest),
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
        element: withSuspense(Mine),
      },
      {
        path: 'share',
        element: withSuspense(Share),
      },
      {
        path: 'post-topic',
        element: (
          <LoginGuard>
            {withSuspense(PostTopic)}
          </LoginGuard>
        ),
      },
      {
        path: 'topic-detail/:id',
        element: withSuspense(TopicDetail),
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
            element: withSuspense(Message),
          },
          {
            path: 'new-follow',
            element: withSuspense(NewFollow),
          },
          {
            path: 'comment-list',
            element: withSuspense(CommentList),
          },
          {
            path: 'system-notify',
            element: withSuspense(SystemNotify),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: withSuspense(Settings),
          },
          {
            path: 'email',
            children: [
              {
                path: 'change',
                children: [
                  {
                    index: true,
                    element: withSuspense(EmailChange),
                  },
                  {
                    path: 'captcha',
                    element: withSuspense(EmailChangeCaptcha),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'export-data',
        element: withSuspense(ExportData),
      },
      {
        path: 'bill',
        element: withSuspense(Bill),
      },
      {
        path: 'asset',
        children: [
          {
            index: true,
            element: withSuspense(AssetManager),
          },
          {
            path: 'add-form/:id?',
            element: withSuspense(AssetFormInfo),
          },
          {
            path: 'add-account',
            element: withSuspense(AddAssetAccount),
          },
          {
            path: 'detail/:id',
            element: withSuspense(AssetDetail),
          },
          {
            path: 'chart',
            element: withSuspense(AssetChart),
          },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          {
            index: true,
            element: withSuspense(FixedExpenses),
          },
          {
            path: 'create',
            element: withSuspense(FixedExpenseCreate),
          },
          {
            path: ':id',
            element: withSuspense(FixedExpenseDetail),
          },
          {
            path: ':id/edit',
            element: withSuspense(FixedExpenseEdit),
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
