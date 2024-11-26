import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Comment, NavBar } from 'bw-mobile';
import styles from './index.module.scss';
import Main from './Main';
import {
  addComment,
  getTopicDetail,
  topicLike,
} from '@/api';
import type {
  TopicDetail as Detail,
} from '@/api';
import config from '@/config';

const TopicDetail: FC = () => {
  const [topic, setTopic] = useState<Detail>();
  const navigate = useNavigate();
  const { id } = useParams();
  const fetchTopic = async () => {
    const { data } = await getTopicDetail(id!);
    setTopic(data);
  };
  useEffect(() => {
    void fetchTopic();
  }, []);
  const handleLike = async (topicId: number) => {
    await topicLike(topicId);
    setTimeout(async () => {
      await fetchTopic();
    }, 100);
  };
  const onSubmit = async (val: string) => {
    await addComment(Number.parseInt(id!), { content: val });
    await fetchTopic();
  };
  return (
    <div className="page">
      <NavBar back="返回" className={styles.nav} onBack={() => navigate(-1)}>
        {config.appName}
      </NavBar>
      <Main
        topic={topic}
        comments={topic?.comments}
        onLike={() => handleLike(topic!.id)}
      />
      <Comment
        onSubmit={onSubmit}
        data={topic!}
        onLike={() => handleLike(topic!.id)}
      />
    </div>
  );
};
export default TopicDetail;
