import { LoginGuard } from '@/components';
import Bookkeeping from '@/pages/bookkeeping';
import CateGory from '@/pages/bookkeeping/CategorySettings';
import Chart from '@/pages/Chart';
import Community from '@/pages/community';
import FollowList from '@/pages/community/FollowList';
import Personal from '@/pages/community/Personal';
import Editing from '@/pages/Detail_editing';
import Password from '@/pages/Password';
import Sign from '@/pages/Sign';
import UserInfo from '@/pages/UserInfo';
import { createHashRouter } from 'react-router-dom';
import ChartDetails from '@/pages/Chart/details';
import Mine from '@/pages/mine';
import Share from '@/pages/Share';
import PostTopic from '@/pages/PostTopic';
import TopicDetail from '@/pages/TopicDetail';
import Login from '@/pages/Login';
import Detail from '@/pages/detail';
import Message from '@/pages/Message';
import NewFollow from '@/pages/new-follow';
import CommentList from '@/pages/comment-list';
import SystemNotify from '@/pages/system-notify';
import Settings from '@/pages/settings';
import ExportData from '@/pages/export-data';
import Bill from '@/pages/bill';
import NotFound from '@/pages/NotFound';
import FirstScreen from '@/pages/FirstScreen';
import { Root } from '@/Root';
import ForgetPassword from '@/pages/ForgetPassword/ForgetPassword';
import ForgetPasswordVerifyCode from '@/pages/ForgetPassword/ForgetPasswordVerifyCode';
import ForgetPasswordRest from '@/pages/ForgetPassword/ForgetPasswordReset';
import EmailChangeCaptcha from '@/pages/EmailChange/EmailChangeCaptcha';
import EmailChange from '@/pages/EmailChange';

export const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <FirstScreen />,
      },
      {
        path: 'bookkeeping',
        element: <Bookkeeping />,
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
        element: <Chart />,
      },
      {
        path: 'ChartDetails',
        element: <ChartDetails />,
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
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
