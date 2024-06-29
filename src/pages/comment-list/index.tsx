import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import CommentListItem from '@/pages/comment-list/components';
import { showDate } from '@/utils/time';
import { useGetTopicIdCommentQuery } from '@/hooks/query/useGetTopicIdCommentQuery';
import { useUserStore } from '@/store';

function CommentList() {
  const { userInfo } = useUserStore(({ userInfo }) => ({ userInfo }));
  const navigate = useNavigate();
  const { data, isLoading } = useGetTopicIdCommentQuery({
    params: `${userInfo!.id}`,
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
