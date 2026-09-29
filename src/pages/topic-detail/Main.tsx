import type { FC } from 'react';
import type { TopicDetail } from '@/entities/topic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicItem } from '@/entities/topic';
import ReplyArea from '@/pages/topic-detail/ReplyArea';
import config from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useCopyAction } from '@/shared/lib';
import { FixedPin, ImagePreview } from '@/shared/ui';
import { showAppNotice } from '@/shared/ui/app-feedback';
import styles from './index.module.scss';

interface MainProps {
  topic?: TopicDetail;
  comments?: TopicDetail['comments'];
  onLike: () => void;
}

const Main: FC<MainProps> = ({ topic, comments, onLike }) => {
  const { t } = useTranslation('community');
  const navigate = useNavigate();
  const { copyText } = useCopyAction();
  const [imgVisible, setImgVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: config.appName, url });
        return;
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
      }
    }
    const copied = await copyText({ key: 'topic-link', text: url, failureMessage: t('share.fail') });
    if (copied)
      showAppNotice(t('share.copied'));
  };

  return (
    <main className={styles.content}>
      <FixedPin onClick={() => void handleShare()}>{t('share.share')}</FixedPin>
      <ImagePreview
        visible={imgVisible}
        image={imgSrc}
        onClose={() => setImgVisible(false)}
      />
      {topic && (
        <section className={styles['topic-card']}>
          <TopicItem
            data={topic}
            onAuthor={userId => navigate(`/community/personal/${userId}`)}
            onAvatar={userId => navigate(`/community/personal/${userId}`)}
            onShare={() => void handleShare()}
            onLike={onLike}
            onImg={(_, src) => {
              setImgVisible(true);
              setImgSrc(src);
            }}
          />
        </section>
      )}
      <section className={styles['reply-card']}>
        <ReplyArea comments={comments} />
      </section>
    </main>
  );
};

export default Main;
