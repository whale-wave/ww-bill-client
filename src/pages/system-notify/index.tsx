import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/ui/index.ts';
import { useGetSystemNotifyQuery } from '@/hooks';
import CommentListItem from '@/pages/comment-list/components';
import { showDate } from '@/utils/time';

function SystemNotify() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetSystemNotifyQuery();

  if (isLoading)
    return <div>loading...</div>;

  return (
    <div>
      <NavBar back="返回" onBack={() => navigate(-1)}>
        系统通知
      </NavBar>
      {data.map((i: any) => {
        return (
          <CommentListItem
            key={i.id}
            name={i.user.name}
            time={showDate(i.createdAt)}
            content={i.content}
            avatar={i.user.avatar}
            coverPicture={i.coverPicture}
          />
        );
      })}
    </div>
  );
}

export default SystemNotify;
