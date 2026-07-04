import { useNavigate } from 'react-router-dom';
import { useGetTopicIdCommentQuery } from '@/entities/topic';
import { useGetUserUserInfoQuery } from '@/entities/user';
import CommentListItem from '@/pages/comment-list/components';
import { showDate } from '@/shared/lib/time';
import { NavBar } from '@/shared/ui';

function CommentList() {
  const { data: userInfo } = useGetUserUserInfoQuery();
  const navigate = useNavigate();
  const userId = userInfo?.id ? `${userInfo.id}` : '';
  const { data, isLoading } = useGetTopicIdCommentQuery({
    params: userId,
    options: {
      enabled: !!userId,
    },
  });

  return (
    <div className="page">
      <NavBar
        style={{ background: '#fff' }}
        onBack={() => navigate(-1)}
        back="返回"
      >
        评论
      </NavBar>
      {isLoading
        ? (
            <div className="loading">
              <div className="loading-icon" />
              加载中...
            </div>
          )
        : (
            <div>
              {data?.data.map(item => (
                <CommentListItem
                  key={item.id}
                  coverPicture={item.topic.images?.[0]}
                  avatar={item.user.avatar}
                  content={item.content}
                  name={item.user.name}
                  time={showDate(item.createdAt)}
                  onClick={() => navigate(`/topic-detail/${item.topic.id}`)}
                />
              ))}
            </div>
          )}
    </div>
  );
}

export default CommentList;
