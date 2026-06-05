import type { FC } from 'react';
import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { LoginGuard } from '@/components';
import { AddAssetAccount, AssetChart, AssetDetail, AssetFormInfo, AssetManager } from '@/pages/Asset';
import Bill from '@/pages/Bill';
import Bookkeeping from '@/pages/bookkeeping';
import CateGory from '@/pages/bookkeeping/CategorySettings';
import Budget from '@/pages/Budget';
import { ChartCategory, ChartHome } from '@/pages/Chart/index.ts';
import CommentList from '@/pages/comment-list';
import Community from '@/pages/community';
import FollowList from '@/pages/community/FollowList';
import Personal from '@/pages/community/Personal';
import CreateBudgetCategory from '@/pages/CreateBudgetCategory';
import Detail from '@/pages/detail';
import Editing from '@/pages/Detail_editing';
import Discovery from '@/pages/Discovery';
import EmailChange from '@/pages/EmailChange';
import EmailChangeCaptcha from '@/pages/EmailChange/EmailChangeCaptcha';
import ExportData from '@/pages/export-data';
import FirstScreen from '@/pages/FirstScreen';
import FixedExpenses from '@/pages/FixedExpenses';
import FixedExpenseCreate from '@/pages/FixedExpenses/FixedExpenseCreate';
import FixedExpenseDetail from '@/pages/FixedExpenses/FixedExpenseDetail';
import FixedExpenseEdit from '@/pages/FixedExpenses/FixedExpenseEdit';
import ForgetPassword from '@/pages/ForgetPassword/ForgetPassword';
import ForgetPasswordRest from '@/pages/ForgetPassword/ForgetPasswordReset';
import ForgetPasswordVerifyCode from '@/pages/ForgetPassword/ForgetPasswordVerifyCode';
import Invoice from '@/pages/Invoice';
import InvoiceCreate from '@/pages/Invoice/InvoiceCreate';
import InvoiceDetail from '@/pages/Invoice/InvoiceDetail';
import InvoiceEdit from '@/pages/Invoice/InvoiceEdit';
import Login from '@/pages/Login';
import Message from '@/pages/Message';
import Mine from '@/pages/mine';
import NewFollow from '@/pages/new-follow';
import NotFound from '@/pages/NotFound';
import Password from '@/pages/Password';
import PostTopic from '@/pages/PostTopic';
import SearchRecord from '@/pages/SearchRecord';
import Settings from '@/pages/settings';
import Share from '@/pages/Share';
import Sign from '@/pages/Sign';
import SystemNotify from '@/pages/system-notify';
import TopicDetail from '@/pages/TopicDetail';
import UserInfo from '@/pages/UserInfo';
import { Root } from '@/Root';

const RecordCalendar = lazy(() => import('@/pages/RecordCalendar'));

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <FirstScreen />,
      },
      {
        path: 'budget',
        children: [
          {
            index: true,
            element: <Budget />,
          },
          {
            path: 'category/:type',
            element: <CreateBudgetCategory />,
          },
        ],
      },
      {
        path: 'record-calendar',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RecordCalendar />
          </Suspense>
        ),
      },
      {
        path: 'search-record',
        element: <SearchRecord />,
      },
      {
        path: 'invoice',
        children: [
          {
            index: true,
            element: <Invoice />,
          },
          {
            path: ':id',
            element: <InvoiceDetail />,
          },
          {
            path: ':id/edit',
            element: <InvoiceEdit />,
          },
          {
            path: 'create',
            element: <InvoiceCreate />,
          },
        ],
      },
      {
        path: 'bookkeeping',
        element: <Bookkeeping />,
      },
      {
        path: 'discovery',
        element: <Discovery />,
      },
      {
        path: 'community',
        children: [
          {
            index: true,
            element: <Community />,
          },
          {
            path: 'personal/:id',
            element: <Personal />,
          },
          {
            path: 'follow-list/:id/:type',
            element: <FollowList />,
          },
        ],
      },
      {
        path: 'cateGory',
        element: <CateGory />,
      },
      {
        path: 'editing/:id',
        element: <Editing />,
      },
      {
        path: 'user-info',
        element: (
          <LoginGuard>
            <UserInfo />
          </LoginGuard>
        ),
      },
      {
        path: 'password',
        element: (
          <LoginGuard>
            <Password />
          </LoginGuard>
        ),
      },
      {
        path: 'forget-password',
        children: [
          {
            index: true,
            element: <ForgetPassword />,
          },
          {
            path: 'verify-code',
            element: <ForgetPasswordVerifyCode />,
          },
          {
            path: 'reset',
            element: <ForgetPasswordRest />,
          },
        ],
      },
      {
        path: 'sign',
        element: <Sign />,
      },
      {
        path: 'chart',
        children: [
          {
            index: true,
            element: <ChartHome />,
          },
          {
            path: 'category',
            element: <ChartCategory />,
          },
        ],
      },
      {
        path: 'mine',
        element: <Mine />,
      },
      {
        path: 'share',
        element: <Share />,
      },
      {
        path: 'post-topic',
        element: (
          <LoginGuard>
            <PostTopic />
          </LoginGuard>
        ),
      },
      {
        path: 'topic-detail/:id',
        element: <TopicDetail />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'detail',
        element: <Detail />,
      },
      {
        path: 'message',
        children: [
          {
            index: true,
            element: <Message />,
          },
          {
            path: 'new-follow',
            element: <NewFollow />,
          },
          {
            path: 'comment-list',
            element: <CommentList />,
          },
          {
            path: 'system-notify',
            element: <SystemNotify />,
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: <Settings />,
          },
          {
            path: 'email',
            children: [
              {
                path: 'change',
                children: [
                  {
                    index: true,
                    element: <EmailChange />,
                  },
                  {
                    path: 'captcha',
                    element: <EmailChangeCaptcha />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'export-data',
        element: <ExportData />,
      },
      {
        path: 'bill',
        element: <Bill />,
      },
      {
        path: 'asset',
        children: [
          {
            index: true,
            element: <AssetManager />,
          },
          {
            path: 'add-form/:id?',
            element: <AssetFormInfo />,
          },
          {
            path: 'add-account',
            element: <AddAssetAccount />,
          },
          {
            path: 'detail/:id',
            element: <AssetDetail />,
          },
          {
            path: 'chart',
            element: <AssetChart />,
          },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          {
            index: true,
            element: <FixedExpenses />,
          },
          {
            path: 'create',
            element: <FixedExpenseCreate />,
          },
          {
            path: ':id',
            element: <FixedExpenseDetail />,
          },
          {
            path: ':id/edit',
            element: <FixedExpenseEdit />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export const Router: FC = () => {
  return <RouterProvider router={router} />;
};
