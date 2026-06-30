import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Comment, NavBar } from '@/components/ui/index.ts';
import config from '@/config';
import {
  useGetTopicDetailQuery,
  usePostTopicCommentMutation,
  usePutTopicLikeMutation,
} from '@/hooks';
import styles from './index.module.scss';
import Main from './Main';

const emptyCommentData = {
  commentCount: 0,
  likeCount: 0,
  shareCount: 0,
};

const TopicDetail: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const topicId = id ?? '';
  const numericTopicId = Number.parseInt(topicId);
  const { data: topic } = useGetTopicDetailQuery({
    params: {
      id: topicId,
    },
    options: {
      enabled: !!topicId,
    },
  });
  const [putTopicLike] = usePutTopicLikeMutation();
  const [postTopicComment] = usePostTopicCommentMutation();

  const handleLike = async () => {
    if (!topic)
      return;
    await putTopicLike(topic.id);
  };

  const onSubmit = async (val: string) => {
    if (!Number.isFinite(numericTopicId))
      return;
    await postTopicComment({
      body: { content: val },
      topicId: numericTopicId,
    });
  };

  return (
    <div className="page">
      <NavBar back="返回" className={styles.nav} onBack={() => navigate(-1)}>
        {config.appName}
      </NavBar>
      <Main
        topic={topic}
        comments={topic?.comments}
        onLike={handleLike}
      />
      <Comment
        onSubmit={onSubmit}
        data={topic ?? emptyCommentData}
        onLike={handleLike}
      />
    </div>
  );
};
export default TopicDetail;
