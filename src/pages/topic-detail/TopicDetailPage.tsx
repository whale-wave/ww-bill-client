import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetTopicDetailQuery,
  usePostTopicCommentMutation,
  usePutTopicLikeMutation,
} from '@/entities/topic';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { Comment, PageHeader } from '@/shared/ui';
import styles from './index.module.scss';
import Main from './Main';

const emptyCommentData = {
  commentCount: 0,
  likeCount: 0,
  shareCount: 0,
};

const TopicDetail: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('community');
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
    <div className="page-new relative overflow-hidden" data-topic-detail-page>
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={config.appName} />
      <Main
        topic={topic}
        comments={topic?.comments}
        onLike={handleLike}
      />
      <div className={styles['comment-bar']}>
        <Comment
          onSubmit={onSubmit}
          data={topic ?? emptyCommentData}
          onLike={handleLike}
        />
      </div>
    </div>
  );
};
export default TopicDetail;
